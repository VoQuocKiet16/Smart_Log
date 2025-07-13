import { useNavigation, useRoute } from '@react-navigation/native';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Button, Card, Chip, Divider, IconButton, Text, TextInput } from 'react-native-paper';
import { apiService } from './services/api';

const TeacherInputScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { className, existingData } = route.params as { 
    className?: string; 
    existingData?: any; 
  };
  console.log('className param:', className);
  console.log('existingData:', existingData);
  
  const [classSize, setClassSize] = useState<string>('40');
  const [absences, setAbsences] = useState<string>('2');
  const [absenceReason, setAbsenceReason] = useState<string>('Bệnh');
  const [ratings, setRatings] = useState<string[]>(['A', 'A', 'B', 'A', 'C']);
  const [teacherStatus, setTeacherStatus] = useState<string[]>([
    'Vắng',
    'Có',
    'Có',
    'Có',
    'Có',
  ]);
  const [teacherAbsenceReason, setTeacherAbsenceReason] = useState<string[]>(['Bệnh', '', '', '', '']);
  const [selectedSession, setSelectedSession] = useState<number>(0);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const [openStatusDropdownIndex, setOpenStatusDropdownIndex] = useState<number | null>(null);
  const [openSessionDropdown, setOpenSessionDropdown] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // Load dữ liệu từ params khi component mount
  useEffect(() => {
    if (existingData) {
      setClassSize(existingData.classSize.toString());
      setAbsences(existingData.absences.toString());
      setRatings(existingData.ratings);
      setTeacherStatus(existingData.teacherStatus);
      setTeacherAbsenceReason(existingData.teacherAbsenceReason);
    } else {
      // Nếu không có dữ liệu, để trống tất cả
      setClassSize('');
      setAbsences('');
      setRatings(['', '', '', '', '']);
      setTeacherStatus(['', '', '', '', '']);
      setTeacherAbsenceReason(['', '', '', '', '']);
    }
  }, [existingData]);

  const handleTeacherStatusChange = (value: string, sessionIndex: number) => {
    const newStatus = [...teacherStatus];
    newStatus[sessionIndex] = value;
    setTeacherStatus(newStatus);
    if (value === 'Vắng') {
      const newReasons = [...teacherAbsenceReason];
      newReasons[sessionIndex] = newReasons[sessionIndex] || '';
      setTeacherAbsenceReason(newReasons);
    } else {
      const newReasons = [...teacherAbsenceReason];
      newReasons[sessionIndex] = '';
      setTeacherAbsenceReason(newReasons);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Validate dữ liệu
      if (!className) {
        Alert.alert('Lỗi', 'Thiếu thông tin tên lớp');
        return;
      }

      if (!classSize || parseInt(classSize) <= 0) {
        Alert.alert('Lỗi', 'Sĩ số lớp phải lớn hơn 0');
        return;
      }

      if (!absences || parseInt(absences) < 0) {
        Alert.alert('Lỗi', 'Số học sinh vắng không được âm');
        return;
      }

      if (parseInt(absences) > parseInt(classSize)) {
        Alert.alert('Lỗi', 'Số học sinh vắng không được lớn hơn sĩ số lớp');
        return;
      }

      // Kiểm tra nếu có giáo viên vắng thì phải có lý do
      for (let i = 0; i < teacherStatus.length; i++) {
        if (teacherStatus[i] === 'Vắng' && !teacherAbsenceReason[i]) {
          Alert.alert('Lỗi', `Vui lòng nhập lý do vắng cho tiết ${i + 1}`);
          return;
        }
      }

      // Chuẩn bị dữ liệu để gửi
      const teacherData = {
        className: className,
        classSize: parseInt(classSize),
        absences: parseInt(absences),
        ratings: ratings,
        teacherStatus: teacherStatus,
        teacherAbsenceReason: teacherAbsenceReason,
      };

      // Gọi API để thêm dữ liệu
      const response = await apiService.addTeacherReport(teacherData);
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Thành công
      Alert.alert(
        'Thành công', 
        `Đã cập nhật thông tin giám thị cho lớp ${className} thành công!`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Về lại index screen ngay lập tức
              navigation.goBack();
            }
          }
        ]
      );

    } catch (error) {
      console.error('Lỗi khi cập nhật dữ liệu:', error);
      Alert.alert(
        'Lỗi', 
        `Không thể cập nhật dữ liệu: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`,
        [
          {
            text: 'Thử lại',
            onPress: () => setIsSubmitting(false)
          },
          {
            text: 'Hủy',
            style: 'cancel'
          }
        ]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'A': return '#50C878';
      case 'B': return '#F5A623';
      case 'C': return '#E57373';
      case 'D': return '#D32F2F';
      default: return '#757575';
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={28}
          iconColor="#fff"
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        />
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Cập nhật giám thị
        </Text>
        <Text variant="titleMedium" style={styles.className}>
          Lớp {className || ''}
        </Text>
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <Card style={styles.mainCard}>
            <Card.Content>
              {/* Thông tin cơ bản */}
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  📊 Thông tin cơ bản
                </Text>
                <TextInput
                  label="Sĩ số lớp"
                  value={classSize}
                  onChangeText={setClassSize}
                  keyboardType="numeric"
                  style={styles.input}
                  mode="outlined"
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#4A90E2"
                  textColor="#333333"
                  left={<TextInput.Icon icon="account-group" color="#4A90E2" />}
                  disabled={isSubmitting}
                />
                <TextInput
                  label="Số học sinh vắng"
                  value={absences}
                  onChangeText={setAbsences}
                  keyboardType="numeric"
                  style={styles.input}
                  mode="outlined"
                  outlineColor="#E0E0E0"
                  activeOutlineColor="#4A90E2"
                  textColor="#333333"
                  left={<TextInput.Icon icon="account-remove" color="#E57373" />}
                  disabled={isSubmitting}
                />
              </View>

              <Divider style={styles.divider} />

              {/* Đánh giá tiết học */}
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  ⭐ Đánh giá tiết học
                </Text>
                <View style={styles.ratingContainer}>
                  {ratings.map((rating, index) => (
                    <View key={index} style={styles.ratingItem}>
                      <Text style={styles.sessionNumber}>Tiết {index + 1}</Text>
                      <TouchableOpacity 
                        onPress={() => setOpenDropdownIndex(openDropdownIndex === index ? null : index)}
                        disabled={isSubmitting}
                      >
                        <Chip
                          mode="outlined"
                          style={[styles.ratingChip, { borderColor: rating ? getRatingColor(rating) : '#E0E0E0' }]}
                          textStyle={{ color: rating ? getRatingColor(rating) : '#9E9E9E', fontStyle: rating ? 'normal' : 'italic' }}
                          icon={openDropdownIndex === index ? "chevron-up" : "chevron-down"}
                        >
                          {rating || 'Trống'}
                        </Chip>
                      </TouchableOpacity>
                      {openDropdownIndex === index && (
                        <View style={styles.dropdown}>
                          {['', 'A', 'B', 'C', 'D'].map((option) => (
                            <TouchableOpacity
                              key={option}
                              onPress={() => {
                                const newRatings = [...ratings];
                                newRatings[index] = option;
                                setRatings(newRatings);
                                setOpenDropdownIndex(null);
                              }}
                            >
                              <Text
                                style={[
                                  styles.dropdownItem,
                                  {
                                    color: option ? getRatingColor(option) : '#9E9E9E',
                                    fontWeight: rating === option ? 'bold' : 'normal',
                                    backgroundColor: rating === option ? '#F5F7FA' : '#fff',
                                    fontStyle: option === '' ? 'italic' : 'normal',
                                  },
                                ]}
                              >
                                {option === '' ? 'Trống' : option}
                                {rating === option && <Text style={styles.dropdownTick}> ✓</Text>}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              </View>

              <Divider style={styles.divider} />

              {/* Tình trạng giáo viên */}
              <View style={styles.section}>
                <Text variant="titleMedium" style={styles.sectionTitle}>
                  👨‍🏫 Tình trạng giáo viên
                </Text>
                <View style={styles.ratingContainer}>
                  {teacherStatus.map((status, index) => (
                    <View key={index} style={styles.ratingItemColumn}>
                      <View style={styles.ratingItemRow}>
                        <Text style={styles.sessionNumber}>Tiết {index + 1}</Text>
                        <TouchableOpacity 
                          style={{ flex: 1 }} 
                          onPress={() => setOpenStatusDropdownIndex(openStatusDropdownIndex === index ? null : index)}
                          disabled={isSubmitting}
                        >
                          <Chip
                            mode="outlined"
                            style={[styles.ratingChip, { borderColor: status ? (status === 'Có' ? '#50C878' : '#E57373') : '#E0E0E0' }]}
                            textStyle={{ color: status ? (status === 'Có' ? '#50C878' : '#E57373') : '#9E9E9E', fontStyle: status ? 'normal' : 'italic' }}
                            icon={openStatusDropdownIndex === index ? "chevron-up" : "chevron-down"}
                          >
                            {status || 'Trống'}
                          </Chip>
                        </TouchableOpacity>
                        {openStatusDropdownIndex === index && (
                          <View style={styles.dropdownStatus}>
                            {['', 'Có', 'Vắng'].map((option) => (
                              <TouchableOpacity
                                key={option}
                                onPress={() => {
                                  handleTeacherStatusChange(option, index);
                                  setOpenStatusDropdownIndex(null);
                                }}
                              >
                                <Text
                                  style={[
                                    styles.dropdownItem,
                                    {
                                      color: option === '' ? '#9E9E9E' : option === 'Có' ? '#50C878' : '#E57373',
                                      fontWeight: status === option ? 'bold' : 'normal',
                                      backgroundColor: status === option ? '#F5F7FA' : '#fff',
                                      fontStyle: option === '' ? 'italic' : 'normal',
                                    },
                                  ]}
                                >
                                  {option === '' ? 'Trống' : option}
                                  {status === option && <Text style={styles.dropdownTick}> ✓</Text>}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                      {status === 'Vắng' && (
                        <TextInput
                          label="Lý do vắng giáo viên"
                          value={teacherAbsenceReason[index]}
                          onChangeText={(text: string) => {
                            const newReasons = [...teacherAbsenceReason];
                            newReasons[index] = text;
                            setTeacherAbsenceReason(newReasons);
                          }}
                          style={styles.absentReasonInput}
                          mode="outlined"
                          outlineColor="#E0E0E0"
                          activeOutlineColor="#E57373"
                          textColor="#333333"
                          left={<TextInput.Icon icon="alert-circle" color="#E57373" />}
                          disabled={isSubmitting}
                        />
                      )}
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  style={styles.submitButton}
                  buttonColor="#F5A623"
                  textColor="#FFFFFF"
                  onPress={handleSubmit}
                  contentStyle={styles.buttonContent}
                  icon={isSubmitting ? undefined : "check"}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                      <ActivityIndicator size="small" color="#FFFFFF" />
                      <Text style={{ color: '#FFFFFF', marginLeft: 8, fontSize: 16 }}>Đang cập nhật...</Text>
                    </View>
                  ) : (
                    'Cập nhật thông tin'
                  )}
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#4A90E2',
  },
  headerTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 2,
    marginTop: 20,
  },
  className: {
    color: 'white',
    opacity: 0.9,
  },
  mainCard: {
    margin: 16,
    borderRadius: 16,
    elevation: 4,
    backgroundColor: '#FFFFFF',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#4A90E2',
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  divider: {
    marginVertical: 16,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  ratingContainer: {
    gap: 12,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  sessionNumber: {
    fontWeight: 'bold',
    width: 60,
    color: '#4A90E2',
  },
  ratingChip: {
    marginLeft: 8,
  },
  dropdown: {
    position: 'absolute',
    top: 48,
    left: 80,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    zIndex: 10,
    elevation: 4,
    minWidth: 100,
    // borderRadius: 8,
  },
  dropdownStatus: {
    position: 'absolute',
    top: 35,
    left: 70,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    zIndex: 10,
    elevation: 4,
    minWidth: 100,
    // borderRadius: 8,
  },
  dropdownItem: {
    padding: 10,
    textAlign: 'center',
  },
  dropdownTick: {
    marginLeft: 8,
    color: '#4A90E2',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sessionSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F5F7FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  sessionLabel: {
    fontWeight: 'bold',
    width: 80,
    color: '#4A90E2',
  },
  sessionPicker: {
    flex: 1,
    height: 40,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F5F7FA',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  statusLabel: {
    fontWeight: 'bold',
    width: 80,
    color: '#4A90E2',
  },
  statusPicker: {
    flex: 1,
    height: 40,
  },
  buttonContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  submitButton: {
    borderRadius: 12,
    paddingHorizontal: 32,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  absentReasonInput: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
  },
  ratingItemColumn: {
    flexDirection: 'column',
    backgroundColor: '#F5F7FA',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    position: 'relative',
  },
  ratingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backIcon: {
    position: 'absolute',
    left: 0,
    top: 30,
    zIndex: 10,
    backgroundColor: 'transparent',
  },
});

export default TeacherInputScreen; 