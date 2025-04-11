import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  Platform 
} from 'react-native';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/Feather'; 
import DateTimePickerModal from "react-native-modal-datetime-picker";
import * as ImagePicker from 'expo-image-picker';

const ProfileDetails = () => {
  const [firstName, setFirstName] = useState('David');
  const [lastName, setLastName] = useState('Peterson');
  const [date, setDate] = useState(null);
  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const placeholder = require("@/assets/images/placeholder_avatar.png");

  const pickImageAsync = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    } else {
      alert('You did not select any image.');
    }
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric', 
      year: 'numeric'
    });
  };

  const showDatePicker = () => {
    setOpen(true);
  };

  const hideDatePicker = () => {
    setOpen(false);
  };

  const handleSelect = (date) => {
    setDate(date)
    hideDatePicker();
  };

  const handleConfirm = ()=>{
    // do something when click confirm button
  }

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Profile details</Text>
      </View>
      
      <View style={styles.profileImageContainer}>
        <View style={styles.imageWrapper}>
        <Image
          style={styles.profileImage}
          source={selectedImage}
          placeholder={placeholder}
          contentFit="cover"
          transition={1000}
        />
        </View>
        <TouchableOpacity style={styles.cameraButton}>
          <Icon name="camera" size={18} color="white" onPress={pickImageAsync}/>
        </TouchableOpacity>
      </View>
      
      <View style={styles.form}>
        {/* First Name */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>First name</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Last name</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Birthday</Text>
          <TouchableOpacity 
            style={date ? styles.dateInput : styles.birthdayButton}
            onPress={showDatePicker}
          >
            <Icon 
              name="calendar" 
              size={20} 
              color="#E57373" 
              style={styles.calendarIcon} 
            />
            <Text style={date ? styles.dateText : styles.birthdayText}>
              {date ? formatDate(date) : "Choose birthday date"}
            </Text>
          </TouchableOpacity>
        </View>

        <DateTimePickerModal
          isVisible={open}
          mode="date"
          onConfirm={handleSelect}
          onCancel={hideDatePicker}
        />
    
        <TouchableOpacity style={styles.confirmButton}>
          <Text style={styles.confirmText} onPress={handleConfirm}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingTop: 20
  },
  titleContainer: {
    marginTop: 60,
    marginBottom: 60
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center'
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 60,
    position: 'relative'
  },
  imageWrapper: {
    width: 110,
    height: 110,
    borderRadius: 25,
    backgroundColor: '#EEEEEE',
    overflow: 'hidden'
  },
  profileImage: {
    width: '100%',
    height: '100%'
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: '#E57373',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  form: {
    width: '100%'
  },
  inputContainer: {
    marginBottom: 24
  },
  label: {
    color: '#9E9E9E',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '400'
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
    color: '#212121'
  },
  birthdayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 16,
    padding: 16
  },
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    padding: 16
  },
  calendarIcon: {
    marginRight: 12
  },
  birthdayText: {
    color: '#E57373',
    fontSize: 16
  },
  dateText: {
    color: '#212121',
    fontSize: 16,
    fontWeight: '500'
  },
  confirmButton: {
    backgroundColor: '#E57373',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginTop: 96
  },
  confirmText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500'
  }
});

export default ProfileDetails;