import { NavigationProp, useNavigation } from '@react-navigation/native';
import * as React from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, IconButton, List, Text } from 'react-native-paper';

interface ClassData {
  className: string;
  studentReport: {
    classSize: number;
    absences: number;
    absenceReason: string;
    ratings: string[];
  };
  teacherReport: {
    classSize: number;
    absences: number;
    absenceReason: string;
    ratings: string[];
    teacherStatus: string[];
    teacherAbsenceReason: string[];
  };
}

const classData: ClassData[] = Array.from({ length: 10 }, (_, index) => ({
  className: `10A${index + 1}`,
  studentReport: {
    classSize: 40,
    absences: 2,
    absenceReason: 'Bệnh',
    ratings: ['Tốt', 'Tốt', 'Khá', 'Tốt', 'Trung bình'],
  },
  teacherReport: {
    classSize: 40,
    absences: 2,
    absenceReason: 'Bệnh',
    ratings: ['Tốt', 'Tốt', 'Khá', 'Tốt', 'Trung bình'],
    teacherStatus: ['Vắng mặt', 'Có mặt', 'Có mặt', 'Có mặt', 'Có mặt'],
    teacherAbsenceReason: ['Bệnh', '', '', '', ''],
  },
}));

const IndexScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<any>>();
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  const toggleClass = (className: string) => {
    setExpandedClass(expandedClass === className ? null : className);
  };

  const goToTeacherInput = (className: string) => {
    navigation.navigate("Teacher-Input", { className });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text variant="headlineLarge" style={styles.title}>
          Danh sách lớp
        </Text>
      </View>
      {classData.map((item) => (
        <Card key={item.className} style={styles.classCard}>
          <Card.Title
            title={
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.cardTitle}>{`Lớp ${item.className}`}</Text>
                <View style={
                  [styles.statusBox,
                    item.className.endsWith('1')
                      ? styles.statusBoxSuccess
                      : styles.statusBoxDanger
                  ]
                }>
                  <Text style={styles.statusBoxText}>
                    {item.className.endsWith('1') ? 'Đã Lấy Sổ Đầu Bài' : 'Chưa Lấy Sổ Đầu Bài'}
                  </Text>
                </View>
              </View>
            }
            right={(props) => (
              <IconButton
                {...props}
                icon={expandedClass === item.className ? 'chevron-up' : 'chevron-down'}
                iconColor="#4A90E2"
                onPress={() => toggleClass(item.className)}
              />
            )}
          />
          {expandedClass === item.className && (
            <Card.Content>
              <List.Section>
                <List.Subheader style={[styles.subheader, styles.centerSubheader]}>Thông tin học sinh báo cáo</List.Subheader>
                <List.Item
                  title={`Sĩ số: ${item.studentReport.classSize}`}
                  titleStyle={styles.listItemTitle}
                  left={() => <List.Icon icon="account-group" color="#4A90E2" />}
                />
                <List.Item
                  title={`Vắng: ${item.studentReport.absences}`}
                  titleStyle={styles.listItemTitle}
                  left={() => <List.Icon icon="account-remove" color="#E57373" />}
                />
                <List.Item
                  title="Đánh giá tiết học:"
                  titleStyle={styles.listItemTitle}
                  left={() => <List.Icon icon="star" color="#F5A623" />}
                />
                <View style={styles.ratingRow}>
                  {item.studentReport.ratings.map((rating, idx) => (
                    <Card key={idx} style={styles.ratingCard}>
                      <Text style={styles.ratingText}>Tiết {idx + 1}: {rating}</Text>
                    </Card>
                  ))}
                </View>
                <List.Item
                  title="Tình trạng giáo viên:"
                  titleStyle={styles.listItemTitle}
                  left={() => <List.Icon icon="account-tie" color="#50C878" />}
                />
                <View style={styles.ratingRow}>
                  {item.teacherReport.teacherStatus.map((status, idx) => (
                    <Card key={idx} style={styles.ratingCard}>
                      <Text style={styles.ratingText}>
                        Tiết {idx + 1}: {status}
                        {status === 'Vắng mặt' && ` (Lý do: ${item.teacherReport.teacherAbsenceReason[idx]})`}
                      </Text>
                    </Card>
                  ))}
                </View>
              </List.Section>
              <Divider style={styles.divider} />
              <List.Section>
                <List.Subheader style={[styles.subheader, styles.centerSubheader]}>Thông tin giám thị báo cáo</List.Subheader>
                <List.Item
                  title={`Sĩ số: ${item.teacherReport.classSize}`}
                  titleStyle={styles.listItemTitle}
                  left={() => <List.Icon icon="account-group-outline" color="#4A90E2" />}
                />
                <List.Item
                  title={`Vắng: ${item.teacherReport.absences}`}
                  titleStyle={styles.listItemTitle}
                  left={() => <List.Icon icon="account-off-outline" color="#E57373" />}
                />
                <List.Item
                  title="Đánh giá tiết học:"
                  titleStyle={styles.listItemTitle}
                  left={() => <List.Icon icon="star-outline" color="#F5A623" />}
                />
                <View style={styles.ratingRow}>
                  {item.teacherReport.ratings.map((rating, idx) => (
                    <Card key={idx} style={styles.ratingCard}>
                      <Text style={styles.ratingText}>Tiết {idx + 1}: {rating}</Text>
                    </Card>
                  ))}
                </View>
                <List.Item
                  title="Tình trạng giáo viên:"
                  titleStyle={styles.listItemTitle}
                  left={() => <List.Icon icon="account-tie" color="#50C878" />}
                />
                <View style={styles.ratingRow}>
                  {item.teacherReport.teacherStatus.map((status, idx) => (
                    <Card key={idx} style={styles.ratingCard}>
                      <Text style={styles.ratingText}>
                        Tiết {idx + 1}: {status}
                        {status === 'Vắng mặt' && ` (Lý do: ${item.teacherReport.teacherAbsenceReason[idx]})`}
                      </Text>
                    </Card>
                  ))}
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerContainer: {
    marginTop: 24,
    marginBottom: 8,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  classCard: {
    marginHorizontal: 12,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    backgroundColor: '#FFFFFF',
  },
  cardTitle: {
    color: '#333333',
    fontWeight: 'bold',
  },
  subheader: {
    color: '#4A90E2',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listItemTitle: {
    color: '#333333',
  },
  ratingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 4,
  },
  ratingCard: {
    margin: 2,
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#F5F7FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  ratingText: {
    color: '#333333',
    fontSize: 12,
  },
  divider: {
    marginVertical: 8,
    backgroundColor: '#E0E0E0',
  },
  updateButton: {
    marginTop: 16,
    borderRadius: 8,
  },
  centerSubheader: {
    textAlign: 'center',
  },
  statusBox: {
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBoxSuccess: {
    backgroundColor: '#50C878',
  },
  statusBoxDanger: {
    backgroundColor: '#E57373',
  },
  statusBoxText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default IndexScreen;
