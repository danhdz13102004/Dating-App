import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Keyboard,
  Text,
  Dimensions,
  Clipboard
} from 'react-native';
import { Colors } from '../../constants/Colors';

const OTPInputField = ({ otp, setOtp, error, setError, maxLength = 6, autoFocus = true }) => {
  const inputRefs = useRef([]);
  const [localOtp, setLocalOtp] = useState(Array(maxLength).fill(''));

  // Initialize refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, maxLength);
  }, [maxLength]);

  // Populate fields if OTP is already set
  useEffect(() => {
    if (otp) {
      const otpArray = otp.split('');
      setLocalOtp(otpArray.concat(Array(maxLength - otpArray.length).fill('')));
    }
  }, [otp, maxLength]);

  const handleChange = (value, index) => {
    const newOtp = [...localOtp];
    // Allow only numbers
    const sanitizedValue = value.replace(/[^0-9]/g, '');
    
    // Update the value at current index
    newOtp[index] = sanitizedValue.substring(0, 1);
    setLocalOtp(newOtp);
    
    // Update parent state
    setOtp(newOtp.join(''));
    
    // If there's an error, clear it
    if (error) {
      setError('');
    }

    // Auto focus next input if value exists
    if (sanitizedValue && index < maxLength - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    // Handle backspace
    if (e.nativeEvent.key === 'Backspace') {
      if (index > 0 && !localOtp[index]) {
        // If current input is empty, focus previous input
        inputRefs.current[index - 1].focus();
      }
    }
  };
  const handlePaste = async (index) => {
    try {
      // Try to get clipboard content on focus
      // This is for possible auto-fill from SMS
      const clipboardContent = await Clipboard.getString();
      
      // If clipboard contains a number with the expected length
      if (clipboardContent && /^\d+$/.test(clipboardContent) && clipboardContent.length === maxLength) {
        const chars = clipboardContent.split('');
        
        // Update all inputs
        setLocalOtp(chars);
        setOtp(clipboardContent);
        
        // Clear error if any
        if (error) {
          setError('');
        }
        
        // Focus the last input
        inputRefs.current[maxLength - 1].focus();
        Keyboard.dismiss();
      }
    } catch (err) {
      console.log('Clipboard access error:', err);
    }
  };

  return (
    <View style={styles.container}>
      {localOtp.map((digit, index) => (
        <TextInput
          key={index}
          ref={(ref) => (inputRefs.current[index] = ref)}
          style={[
            styles.input,
            error ? styles.inputError : null,
            digit ? styles.inputFilled : null
          ]}
          value={digit}
          onChangeText={(value) => handleChange(value, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          onFocus={() => handlePaste(index)}
          keyboardType="numeric"
          maxLength={1}
          autoFocus={autoFocus && index === 0}
          selectTextOnFocus
          testID={`otp-input-${index}`}
        />
      ))}
    </View>
  );
};

const { width } = Dimensions.get('window');
const inputWidth = (width - 100) / 6; // Adjust 100 based on your padding needs

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 10,
  },
  input: {
    width: inputWidth,
    height: 55,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primaryColor,
    backgroundColor: '#F9F9F9',
  },
  inputFilled: {
    borderColor: Colors.primaryColor,
    backgroundColor: '#FFF',
  },
  inputError: {
    borderColor: '#FF3B30',
    borderWidth: 1.5,
  },
});

export default OTPInputField;
