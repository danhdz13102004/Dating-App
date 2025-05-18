import React, { useEffect } from 'react';
import { TouchableOpacity, Image, StyleSheet } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import appConfig from '../../configs/config';

// Get Facebook App ID from environment or config
const FB_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID || '1757770771471001';

const FacebookLoginButton = ({ onLoginComplete }) => {
  useEffect(() => {
    try {
      console.log('Facebook App ID:', FB_APP_ID);
      
      // Add listener for deep linking
      const subscription = Linking.addEventListener('url', handleRedirect);
      
      return () => {
        subscription.remove();
      };
    } catch (error) {
      console.error('Error setting up Facebook login:', error);
    }
  }, []);
  
  // Handle redirect from Facebook login
  const handleRedirect = (event) => {
    if (event.url.includes('facebook')) {
      console.log('Redirect from Facebook:', event.url);
      WebBrowser.dismissBrowser();
      
      // Extract code from URL
      const url = new URL(event.url);
      const code = url.searchParams.get('code');
      
      if (code && onLoginComplete) {
        onLoginComplete({
          type: 'success',
          params: { code },
          url: event.url
        });
      }
    }
  };

  // Use custom implementation with WebBrowser instead of LoginButton
  const handleFacebookLogin = async () => {
    try {
      // Create redirect URL
      const redirectUrl = Linking.createURL('facebook-auth');
      
      // Construct Facebook OAuth URL
      const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
        `client_id=${FB_APP_ID}` +
        `&redirect_uri=${encodeURIComponent(redirectUrl)}` +
        `&response_type=code` +
        `&scope=email,public_profile`;
      
      console.log('Opening Facebook auth URL:', authUrl);
      
      // Open browser for Facebook login
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUrl);
      
      console.log('WebBrowser result:', result);
      
      if (result.type === 'success' && onLoginComplete) {
        // Extract code from URL
        const url = new URL(result.url);
        const code = url.searchParams.get('code');
        
        if (code) {
          onLoginComplete({
            type: 'success',
            params: { code },
            url: result.url
          });
        }
      } else if (result.type === 'cancel' || result.type === 'dismiss') {
        if (onLoginComplete) {
          onLoginComplete({ type: 'cancel' });
        }
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      if (onLoginComplete) {
        onLoginComplete({ 
          type: 'error',
          error
        });
      }
    }
  };  return (
    <TouchableOpacity onPress={handleFacebookLogin} style={styles.iconButton}>
      <Image
        source={require('../../assets/images/facebook-icon.png')}
        style={styles.roundedSocialIcon}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    marginHorizontal: 20,
  },
  roundedSocialIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});

export default FacebookLoginButton;