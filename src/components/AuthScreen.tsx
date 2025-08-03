"use client";

import { useState } from "react";
import { Alert, TextInput, View } from "react-native";
import {
  CurrentAccount,
  generateAccountKey,
  isValidAccountKey,
} from "../utils/client-auth";
import { makeStyles } from "../utils/styles";
import { AppButton } from "./AppButton";
import { AppText } from "./AppText";

export const AuthScreen: React.FC = () => {
  const [enteredKey, setEnteredKey] = useState("");
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  const handleGenerateKey = async () => {
    const newKey = generateAccountKey();
    setEnteredKey(newKey);

    await navigator.clipboard.writeText(newKey);
    setShowSaveMessage(true);
  };

  const handleEnterExistingKey = () => {
    if (!isValidAccountKey(enteredKey)) {
      Alert.alert("Invalid Key", "Please enter a valid account key");
      return;
    }
    CurrentAccount.set(enteredKey);
  };

  return (
    <View style={styles.container}>
      <AppText style={styles.title} variant="title" color="text">
        Account Setup
      </AppText>

      <AppText style={styles.description} variant="body" color="textSecondary">
        Generate a new account key or enter an existing one. Your account key
        acts as both your ID and password.
      </AppText>

      <AppButton
        title="Generate New Account Key"
        onPress={handleGenerateKey}
        style={styles.button}
      />

      {showSaveMessage && (
        <View style={styles.saveMessage}>
          <AppText
            style={styles.saveMessageText}
            variant="body"
            color="primary"
          >
            ✓ Key copied to clipboard! Please save it somewhere safe.
          </AppText>
        </View>
      )}
      <AppText style={styles.orText} variant="body" color="textSecondary">
        OR
      </AppText>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.keyInput}
          value={enteredKey}
          onChangeText={setEnteredKey}
          placeholder="Enter your existing account key..."
          placeholderTextColor="#9CA3AF"
          autoCorrect={false}
          autoCapitalize="none"
          spellCheck={false}
        />
      </View>

      <AppButton
        title="Continue"
        onPress={handleEnterExistingKey}
        disabled={!enteredKey.trim()}
        style={styles.button}
      />
    </View>
  );
};

const styles = makeStyles((theme) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    maxWidth: 800,
    justifySelf: "center",
  },
  title: {
    textAlign: "center",
    marginBottom: theme.spacing(5),
  },
  description: {
    textAlign: "center",
    marginBottom: theme.spacing(7.5),
    lineHeight: 24,
  },
  buttonContainer: {
    gap: theme.spacing(3),
  },
  button: {
    width: "100%",
  },
  orText: {
    marginVertical: theme.spacing(3),
    alignSelf: "center",
  },
  secondaryButton: {
    backgroundColor: theme.colors.surface,
  },
  inputContainer: {
    marginBottom: theme.spacing(7.5),
  },
  keyInput: {
    ...theme.typography.body,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: theme.spacing(4),
    color: theme.colors.text,
    borderWidth: 2,
    borderColor: theme.colors.border,
    minHeight: 60,
  },
  saveMessage: {
    backgroundColor: theme.colors.surface,
    borderRadius: 8,
    padding: theme.spacing(3),
    marginTop: theme.spacing(3),
    alignItems: "center",
  },
  saveMessageText: {
    textAlign: "center",
    fontWeight: "500",
  },
}));
