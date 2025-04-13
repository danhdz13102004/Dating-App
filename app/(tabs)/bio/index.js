import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { jwtDecode } from 'jwt-decode';

const Login = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Kiểm tra token và lấy thông tin người dùng khi component được load
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Lấy token từ AsyncStorage
                const token = await AsyncStorage.getItem('authToken');
                
                if (!token) {
                    // Không có token - chuyển hướng về trang đăng nhập
                    console.log('No token found, redirecting to login');
                    router.replace('/(auth)/login');
                    return;
                }

                console.log('Token found in Bio screen');
                
                // Thử decode token để lấy thông tin
                try {
                    // Sử dụng thư viện jwt-decode
                    const decoded = jwtDecode(token);
                    console.log('Decoded token:', decoded);
                    setUserData(decoded);
                } catch (decodeError) {
                    console.error('Error decoding token:', decodeError);
                    setError('Không thể giải mã token. Vui lòng đăng nhập lại.');
                    setTimeout(() => {
                        AsyncStorage.removeItem('authToken');
                        router.replace('/(auth)/login');
                    }, 2000);
                }
            } catch (error) {
                console.error('Authentication check error:', error);
                setError('Đã xảy ra lỗi. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Hiển thị màn hình loading khi đang kiểm tra xác thực
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Đang tải thông tin...</Text>
            </View>
        );
    }

    // Hiển thị lỗi nếu có
    if (error) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
                <Text style={styles.title}>Thông tin người dùng</Text>
                
                {userData && (
                    <View style={styles.userInfoContainer}>
                        <Text style={styles.userInfoLabel}>ID Người dùng:</Text>
                        <Text style={styles.userInfoValue}>{userData.userId || 'Không tìm thấy ID'}</Text>
                        
                        <View style={styles.infoSection}>
                            <Text style={styles.sectionTitle}>Thông tin JWT Token</Text>
                            <Text style={styles.infoText}>
                                <Text style={styles.infoLabel}>Thời gian tạo (iat): </Text>
                                {new Date(userData.iat * 1000).toLocaleString()}
                            </Text>
                            <Text style={styles.infoText}>
                                <Text style={styles.infoLabel}>Thời gian hết hạn (exp): </Text>
                                {new Date(userData.exp * 1000).toLocaleString()}
                            </Text>
                        </View>
                        
                        <View style={styles.noteSection}>
                            <Text style={styles.sectionTitle}>Lưu ý</Text>
                            <Text style={styles.noteText}>
                                Token JWT hiện tại chỉ chứa ID người dùng. Để hiển thị thêm thông tin cá nhân 
                                chi tiết (như tên, email, bio), bạn cần lấy thêm dữ liệu từ API hoặc bổ sung 
                                thông tin vào JWT payload.
                            </Text>
                        </View>
                    </View>
                )}
                
                {!userData && (
                    <Text style={styles.noDataText}>Không thể tải thông tin người dùng</Text>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
    userInfoContainer: {
        backgroundColor: '#f5f5f5',
        padding: 15,
        borderRadius: 10,
    },
    userInfoLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
    },
    userInfoValue: {
        fontSize: 16,
        marginBottom: 10,
        color: '#007bff',
        fontWeight: '500',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginVertical: 10,
    },
    infoSection: {
        marginTop: 20,
        backgroundColor: '#eef6ff',
        padding: 12,
        borderRadius: 8,
    },
    noteSection: {
        marginTop: 20,
        backgroundColor: '#fff4e5',
        padding: 12,
        borderRadius: 8,
    },
    infoText: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: 5,
    },
    infoLabel: {
        fontWeight: '500',
    },
    noteText: {
        fontSize: 14,
        lineHeight: 20,
        color: '#664d03',
    },
    noDataText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#888',
        marginTop: 20,
    }
});

export default Login;