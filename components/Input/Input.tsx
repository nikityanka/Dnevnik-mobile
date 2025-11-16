import { StyleSheet, TextInput, TextInputProps } from "react-native";

export function Input(props: TextInputProps) {
    return (
        <TextInput 
        style={styles.input}
        {...props}
        placeholderTextColor={'#FFFFFF'}
        />
    )
}

const styles = StyleSheet.create({
    input: {
        fontSize: 16,
        color: '#FFFFFF',
        height: 58,
        paddingHorizontal: 24,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#FFFFFF',
        backgroundColor: '#012FA7',
    },
});