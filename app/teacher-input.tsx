import { useNavigation, useRoute } from '@react-navigation/native';
import * as React from 'react';
import { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Button, Card, Chip, Divider, IconButton, Text, TextInput } from 'react-native-paper';

const TeacherInputScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { className } = route.params as { className?: string };
  console.log('className param:', className);
  const [classSize, setClassSize] = useState<string>('40');
  const [absences, setAbsences] = useState<string>('2');
  const [absenceReason, setAbsenceReason] = useState<string>('Bệnh');
  const [ratings, setRatings] = useState<string[]>(['Tốt', 'Tốt', 'Khá', 'Tốt', 'Trung bình']);
  const [teacherStatus, setTeacherStatus] = useState<string[]>([
    'Vắng mặt',
    'Có mặt',
    'Có mặt',
    'Có mặt',
    'Có mặt',
  ]);
  const [teacherAbsenceReason, setTeacherAbsenceReason] = useState<string[]>(['Bệnh', '', '', '', '']);
  const [selectedSession, setSelectedSession] = useState<number>(0);
  const [openDropdownIndex, setOpenDropdownIndex] = useState<number | null>(null);
  const [openStatusDropdownIndex, setOpenStatusDropdownIndex] = useState<number | null>(null);
  const [openSessionDropdown, setOpenSessionDropdown] = useState<boolean>(false);

  const handleTeacherStatusChange = (value: string, sessionIndex: number) => {
    const newStatus = [...teacherStatus];
    newStatus[sessionIndex] = value;
    setTeacherStatus(newStatus);
    if (value === 'Vắng mặt') {
      const newReasons = [...teacherAbsenceReason];
      newReasons[sessionIndex] = newReasons[sessionIndex] || '';
      setTeacherAbsenceReason(newReasons);
    } else {
      const newReasons = [...teacherAbsenceReason];
      newReasons[sessionIndex] = '';
      setTeacherAbsenceReason(newReasons);
    }
  };

  const handleSubmit = () => {
    alert(`Cập nhật thông tin giám thị cho lớp ${className || ''} thành công!`);
    navigation.goBack();
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'Tốt': return '#50C878';
      case 'Khá': return '#F5A623';
      case 'Trung bình': return '#E57373';
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
                    <TouchableOpacity onPress={() => setOpenDropdownIndex(openDropdownIndex === index ? null : index)}>
                      <Chip
                        mode="outlined"
                        style={[styles.ratingChip, { borderColor: getRatingColor(rating) }]}
                        textStyle={{ color: getRatingColor(rating) }}
                        icon={openDropdownIndex === index ? "chevron-up" : "chevron-down"}
                      >
                        {rating}
                      </Chip>
                    </TouchableOpacity>
                    {openDropdownIndex === index && (
                      <View style={styles.dropdown}>
                        {['Tốt', 'Khá', 'Trung bình'].map((option) => (
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
                                  color: getRatingColor(option),
                                  fontWeight: rating === option ? 'bold' : 'normal',
                                  backgroundColor: rating === option ? '#F5F7FA' : '#fff',
                                },
                              ]}
                            >
                              {option}
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
                      <TouchableOpacity style={{ flex: 1 }} onPress={() => setOpenStatusDropdownIndex(openStatusDropdownIndex === index ? null : index)}>
                        <Chip
                          mode="outlined"
                          style={[styles.ratingChip, { borderColor: status === 'Có mặt' ? '#50C878' : '#E57373' }]}
                          textStyle={{ color: status === 'Có mặt' ? '#50C878' : '#E57373' }}
                          icon={openStatusDropdownIndex === index ? "chevron-up" : "chevron-down"}
                        >
                          {status}
                        </Chip>
                      </TouchableOpacity>
                      {openStatusDropdownIndex === index && (
                        <View style={styles.dropdownStatus}>
                          {['Có mặt', 'Vắng mặt'].map((option) => (
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
                                    color: option === 'Có mặt' ? '#50C878' : '#E57373',
                                    fontWeight: status === option ? 'bold' : 'normal',
                                    backgroundColor: status === option ? '#F5F7FA' : '#fff',
                                  },
                                ]}
                              >
                                {option}
                                {status === option && <Text style={styles.dropdownTick}> ✓</Text>}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                    {status === 'Vắng mặt' && (
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
                icon="check"
              >
                Cập nhật thông tin
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