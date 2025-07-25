import {
  NavigationProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import axios from "axios"; // Thêm axios để fetch API
import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ActivityIndicator,
  Button,
  Card,
  Divider,
  IconButton,
  List,
  Text,
} from "react-native-paper";
import { apiService, TeacherReportData } from "./services/api";

interface ClassData {
  className: string;
  studentReport: {
    classSize: number;
    absences: number;
    ratings: string[];
    teacherStatus: string[];
    teacherAbsenceReason: string[];
  };
  teacherReport: {
    classSize: number;
    absences: number;
    ratings: string[];
    teacherStatus: string[];
    teacherAbsenceReason: string[];
  };
  soDauBai: string; // Thêm trường này để theo dõi trạng thái sổ đầu bài
}

interface StudentApiData {
  soDauBai: string;
  classSize: number;
  lessonRating: string;
  teacherAbsence: number;
}

const IndexScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const route = useRoute<any>();
  const [expandedClass, setExpandedClass] = useState<string | null>(null);
  const [teacherReports, setTeacherReports] = useState<TeacherReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAbsenceReason, setSelectedAbsenceReason] =
    useState<string>("");
  const [studentApiData, setStudentApiData] = useState<StudentApiData[]>([]);

  // Lấy dữ liệu từ API khi component mount
  useEffect(() => {
    loadTeacherReports();
    loadStudentApiData();
    const interval = setInterval(() => {
      loadStudentApiData();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Xử lý dữ liệu mới từ teacher-input
  useEffect(() => {
    if (route.params?.refreshData && route.params?.updatedTeacherReports) {
      console.log(
        "Nhận dữ liệu mới từ teacher-input:",
        route.params.updatedTeacherReports
      );
      setTeacherReports(route.params.updatedTeacherReports);

      // Xóa params để tránh xử lý lại
      navigation.setParams({
        refreshData: undefined,
        updatedTeacherReports: undefined,
      });
    }
  }, [route.params?.refreshData, route.params?.updatedTeacherReports]);

  // Refresh dữ liệu khi focus vào screen (chỉ khi có dữ liệu)
  useFocusEffect(
    useCallback(() => {
      // Tự động refresh dữ liệu khi focus vào index
      console.log("Tự động refresh dữ liệu khi focus vào index");
      loadTeacherReports();
      loadStudentApiData();
    }, [])
  );

  const loadTeacherReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getTeacherReports();
      console.log("Loaded teacher reports:", data);
      setTeacherReports(data);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Không thể tải dữ liệu từ server";
      setError(errorMessage);

      // Chỉ hiển thị alert nếu lỗi nghiêm trọng
      if (
        errorMessage.includes("HTTP error") ||
        errorMessage.includes("network")
      ) {
        Alert.alert(
          "Lỗi kết nối",
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet và thử lại."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Hàm lấy dữ liệu học sinh từ API, mỗi lớp gọi 1 endpoint riêng
  const loadStudentApiData = async () => {
    try {
      const requests = [];
      for (let i = 1; i <= 10; i++) {
        // Gọi API cho từng lớp (V1 -> 10A1, V2 -> 10A2, ...)
        requests.push(
          axios.get(
            `http://kenhsangtaotre.ddns.net:8080/6VhvbMCfNUHcuvntaJt0mx50l4JjhYbU/get/V${i}`
          )
        );
      }
      const responses = await Promise.all(requests);
      // Parse dữ liệu trả về cho từng lớp
      const parsed = responses.map((res) => {
        let arr = res.data;
        if (typeof arr === "string") arr = [arr];
        const str = arr[0] || "";
        if (!str) {
          return {
            soDauBai: "",
            classSize: 0,
            lessonRating: "",
            teacherAbsence: "",
          };
        }
        const [soDauBai, classSize, lessonRating, teacherAbsence] = str.split("?");
        return {
          soDauBai: soDauBai || "",
          classSize: isNaN(Number(classSize)) ? 0 : Number(classSize),
          lessonRating: lessonRating || "",
          teacherAbsence: isNaN(Number(teacherAbsence)) ? "" : teacherAbsence,
        };
      });
      setStudentApiData(parsed);
    } catch (err) {
      setStudentApiData([]);
      console.error("Lỗi khi lấy dữ liệu học sinh từ API:", err);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      setError(null);
      await loadStudentApiData();
      const data = await apiService.getTeacherReports();
      setTeacherReports(data);
    } catch (err) {
      setError("Không thể tải dữ liệu từ server");
    } finally {
      setRefreshing(false);
    }
  };

  // Hàm kết hợp dữ liệu học sinh từ API và dữ liệu giám thị
  const getCombinedData = (): ClassData[] => {
    return Array.from({ length: 10 }, (_, index) => {
      const studentApi = studentApiData[index] || {
        soDauBai: "0",
        classSize: 0,
        lessonRating: "",
        teacherAbsence: 0,
      };
      // Tìm dữ liệu giám thị mới nhất cho lớp này
      const className = `10A${index + 1}`;
      const teacherReportsForClass = teacherReports.filter(
        (report) => report.className === className
      );
      const teacherReport =
        teacherReportsForClass.length > 0
          ? teacherReportsForClass.reduce((latest, current) => {
              return new Date(current.timestamp) > new Date(latest.timestamp)
                ? current
                : latest;
            })
          : null;
      return {
        className,
        studentReport: {
          classSize: studentApi.classSize,
          absences: studentApi.teacherAbsence,
          ratings: [studentApi.lessonRating],
          teacherStatus: [],
          teacherAbsenceReason: [],
        },
        teacherReport: teacherReport
          ? {
              classSize: teacherReport.classSize,
              absences: teacherReport.absences,
              ratings: teacherReport.ratings,
              teacherStatus: teacherReport.teacherStatus,
              teacherAbsenceReason: teacherReport.teacherAbsenceReason,
            }
          : {
              classSize: 0,
              absences: 0,
              ratings: ["", "", "", "", ""],
              teacherStatus: ["", "", "", "", ""],
              teacherAbsenceReason: ["", "", "", "", ""],
            },
        soDauBai: studentApi.soDauBai,
      };
    });
  };

  const toggleClass = (className: string) => {
    setExpandedClass(expandedClass === className ? null : className);
  };

  const goToTeacherInput = (className: string) => {
    // Tìm dữ liệu hiện tại của lớp này
    console.log("Tìm dữ liệu cho lớp:", className);
    console.log("Danh sách teacherReports:", teacherReports);

    // Tìm tất cả dữ liệu cho lớp này
    const teacherReportsForClass = teacherReports.filter((report) => {
      console.log(
        "So sánh:",
        report.className,
        "với",
        className,
        "kết quả:",
        report.className === className
      );
      return report.className === className;
    });

    // Lấy dữ liệu mới nhất (timestamp lớn nhất)
    const currentData =
      teacherReportsForClass.length > 0
        ? teacherReportsForClass.reduce((latest, current) => {
            return new Date(current.timestamp) > new Date(latest.timestamp)
              ? current
              : latest;
          })
        : null;

    console.log("Dữ liệu tìm được:", currentData);

    navigation.navigate("Teacher-Input", {
      className,
      existingData: currentData || null,
    });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorSubText}>
          Ứng dụng sẽ hiển thị dữ liệu mẫu. Bạn có thể thử lại sau.
        </Text>
        <Button
          mode="contained"
          onPress={loadTeacherReports}
          style={styles.retryButton}
        >
          Thử lại
        </Button>
      </View>
    );
  }

  const combinedData = getCombinedData();

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4A90E2"]}
            tintColor="#4A90E2"
          />
        }
      >
        <View style={styles.headerContainer}>
          <Text variant="headlineLarge" style={styles.title}>
            Danh sách lớp
          </Text>
        </View>
        {combinedData.map((item) => (
          <Card key={item.className} style={styles.classCard}>
            <Card.Title
              title={
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Text
                    style={styles.cardTitle}
                  >{`Lớp ${item.className}`}</Text>
                  <View
                    style={[
                      styles.statusBox,
                      item.soDauBai === "1"
                        ? styles.statusBoxSuccess
                        : styles.statusBoxDanger,
                    ]}
                  >
                    <Text style={styles.statusBoxText}>
                      {item.soDauBai === "1"
                        ? "Đã Lấy Sổ Đầu Bài"
                        : "Chưa Lấy Sổ Đầu Bài"}
                    </Text>
                  </View>
                </View>
              }
              right={(props) => (
                <IconButton
                  {...props}
                  icon={
                    expandedClass === item.className
                      ? "chevron-up"
                      : "chevron-down"
                  }
                  iconColor="#4A90E2"
                  onPress={() => toggleClass(item.className)}
                />
              )}
            />
            {expandedClass === item.className && (
              <Card.Content>
                {/* Thông tin học sinh báo cáo*/}
                <List.Section>
                  <List.Subheader
                    style={[styles.subheader, styles.centerSubheader]}
                  >
                    Thông tin học sinh báo cáo
                  </List.Subheader>

                  {/* Sĩ số học sinh */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <List.Item
                        title={`Sĩ số: ${item.studentReport.classSize || "-"}`}
                        titleStyle={styles.listItemTitle}
                        left={() => (
                          <List.Icon icon="account-group" color="#4A90E2" />
                        )}
                        style={styles.compactListItem}
                      />
                    </View>
                  </View>

                  {/* Đánh giá tiết học và Tình trạng giáo viên vắng (hiển thị cùng line, có icon) */}
                  <View style={styles.sectionContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                      <List.Icon icon="star" color="#F5A623" />
                      <Text style={{ color: '#333', marginLeft: 4 }}>
                        Đánh giá tiết học: {item.studentReport.ratings[0]}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <List.Icon icon="account-tie" color="#50C878" />
                      <Text style={{ color: '#333',  marginLeft: 4 }}>
                        Tình trạng giáo viên vắng: {item.studentReport.absences}
                      </Text>
                    </View>
                  </View>
                </List.Section>
                <Divider style={styles.divider} />
                {/* Thông tin giám thị báo cáo*/}
                <List.Section>
                  <List.Subheader
                    style={[styles.subheader, styles.centerSubheader]}
                  >
                    Thông tin giám thị báo cáo
                  </List.Subheader>

                  {/* Sĩ số và Vắng cùng hàng */}
                  <View style={styles.infoRow}>
                    <View style={styles.infoItem}>
                      <List.Item
                        title={`Sĩ số: ${item.teacherReport.classSize}`}
                        titleStyle={styles.listItemTitle}
                        left={() => (
                          <List.Icon
                            icon="account-group-outline"
                            color="#4A90E2"
                          />
                        )}
                        style={styles.compactListItem}
                      />
                    </View>
                    <View style={styles.infoItem}>
                      <List.Item
                        title={`Vắng: ${item.teacherReport.absences}`}
                        titleStyle={styles.listItemTitle}
                        left={() => (
                          <List.Icon
                            icon="account-off-outline"
                            color="#E57373"
                          />
                        )}
                        style={styles.compactListItem}
                      />
                    </View>
                  </View>

                  {/* Đánh giá tiết học */}
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                      <List.Icon icon="star-outline" color="#F5A623" />
                      <Text style={styles.sectionTitle}>Đánh giá tiết học</Text>
                    </View>
                    <View style={styles.ratingGrid}>
                      {item.teacherReport.ratings.map((rating, idx) => (
                        <View key={idx} style={styles.ratingItem}>
                          <Text style={styles.periodLabel}>Tiết {idx + 1}</Text>
                          {rating ? (
                            <View>
                              <Text style={styles.ratingText}>{rating}</Text>
                            </View>
                          ) : (
                            <View style={styles.emptyRating}>
                              <Text style={styles.emptyText}>-</Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>

                  {/* Tình trạng giáo viên */}
                  <View style={styles.sectionContainer}>
                    <View style={styles.sectionHeader}>
                      <List.Icon icon="account-tie" color="#50C878" />
                      <Text style={styles.sectionTitle}>
                        Tình trạng giáo viên
                      </Text>
                    </View>
                    <View style={styles.teacherGrid}>
                      {item.teacherReport.teacherStatus.map((status, idx) => (
                        <View key={idx} style={styles.teacherItem}>
                          <Text style={styles.periodLabel}>Tiết {idx + 1}</Text>
                          {status ? (
                            <TouchableOpacity
                              onPress={() => {
                                if (
                                  status === "Vắng" &&
                                  item.teacherReport.teacherAbsenceReason[idx]
                                ) {
                                  setSelectedAbsenceReason(
                                    item.teacherReport.teacherAbsenceReason[idx]
                                  );
                                  setModalVisible(true);
                                }
                              }}
                              disabled={
                                status !== "Vắng" ||
                                !item.teacherReport.teacherAbsenceReason[idx]
                              }
                            >
                              <View
                                style={[
                                  styles.statusBadge,
                                  status === "Có" && styles.statusPresent,
                                  status === "Vắng" && styles.statusAbsent,
                                ]}
                              >
                                <Text style={styles.statusText}>{status}</Text>
                                {status === "Vắng" &&
                                  item.teacherReport.teacherAbsenceReason[
                                    idx
                                  ] && (
                                    <View style={styles.exclamationMark}>
                                      <Text style={styles.exclamationText}>
                                        !
                                      </Text>
                                    </View>
                                  )}
                              </View>
                            </TouchableOpacity>
                          ) : (
                            <View style={styles.emptyStatus}>
                              <Text style={styles.emptyText}>-</Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>

                  <Button
                    mode="contained"
                    style={styles.updateButton}
                    buttonColor="#F5A623"
                    textColor="#FFFFFF"
                    icon="pencil"
                    onPress={() => goToTeacherInput(item.className)}
                  >
                    Cập nhật thông tin giám thị
                  </Button>
                </List.Section>
              </Card.Content>
            )}
          </Card>
        ))}
        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Modal hiển thị lý do vắng */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        statusBarTranslucent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Lý do vắng</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalReason}>{selectedAbsenceReason}</Text>
            </View>
            <View style={styles.modalFooter}>
              <Button
                mode="contained"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              >
                Đóng
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    marginTop: 24,
    marginBottom: 8,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    fontWeight: "bold",
    color: "#4A90E2",
  },
  loadingText: {
    marginTop: 16,
    color: "#4A90E2",
    fontSize: 16,
  },
  errorText: {
    color: "#E57373",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  errorSubText: {
    color: "#9E9E9E",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#4A90E2",
  },
  classCard: {
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: "#FFFFFF",
  },
  cardTitle: {
    color: "#333333",
    fontWeight: "bold",
  },
  subheader: {
    color: "#4A90E2",
    fontWeight: "bold",
    fontSize: 16,
  },
  listItemTitle: {
    color: "#333333",
  },
  ratingRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 4,
  },
  ratingCard: {
    margin: 2,
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#F5F7FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  ratingText: {
    color: "#333333",
    fontSize: 12,
  },
  divider: {
    marginVertical: 8,
    backgroundColor: "#E0E0E0",
  },
  updateButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  centerSubheader: {
    textAlign: "center",
  },
  statusBox: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBoxSuccess: {
    backgroundColor: "#50C878",
  },
  statusBoxDanger: {
    backgroundColor: "#E57373",
  },
  statusBoxText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  compactListItem: {
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  sectionContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    color: "#333333",
    fontWeight: "bold",
    marginLeft: 8,
  },
  ratingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  ratingItem: {
    alignItems: "center",
    marginVertical: 4,
  },
  periodLabel: {
    color: "#9E9E9E",
    fontSize: 12,
    marginBottom: 4,
  },
  ratingBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  teacherGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
  },
  teacherItem: {
    alignItems: "center",
    marginVertical: 4,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  statusPresent: {
    backgroundColor: "#E8F5E9",
    borderColor: "#4CAF50",
  },
  statusAbsent: {
    backgroundColor: "#FFEBEE",
    borderColor: "#F44336",
  },
  statusText: {
    color: "#333333",
    fontSize: 12,
    fontWeight: "bold",
  },
  absenceReason: {
    color: "#9E9E9E",
    fontSize: 12,
    marginTop: 4,
  },
  emptyRating: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#F5F7FA",
  },
  emptyText: {
    color: "#9E9E9E",
    fontSize: 12,
    fontStyle: "italic",
  },
  emptyStatus: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#F5F7FA",
  },
  exclamationMark: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#F44336",
    borderRadius: 10,
    width: 15,
    height: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  exclamationText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333333",
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#9E9E9E",
  },
  modalBody: {
    width: "100%",
    marginBottom: 20,
  },
  modalReason: {
    color: "#333333",
    fontSize: 16,
    textAlign: "center",
  },
  modalFooter: {
    width: "100%",
  },
  modalButton: {
    backgroundColor: "#4A90E2",
    borderRadius: 8,
  },
});

export default IndexScreen;
