import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import React from "react";
import { Redirect } from "expo-router";

const index = () => {
    return (
        <Redirect href={"/(auth)/login"}>

        </Redirect>
    )
}

const styles = StyleSheet.create({
    text: {
        color: "red",
    },
});

export default index;

