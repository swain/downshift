import type React from "react";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";
import { makeStyles } from "../utils/styles";
import { AppText } from "./AppText";

export type AppButtonProps = {
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  title: string;
  onPress?: () => void;
};

const styles = makeStyles((theme) => ({
  button: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing(4),
    paddingVertical: theme.spacing(3),
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  buttonPressed: {
    backgroundColor: theme.colors.secondary,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.border,
  },
  text: {
    color: theme.colors.background,
    fontFamily: theme.typography.label.fontFamily,
    fontWeight: theme.typography.label.fontWeight,
    fontSize: theme.typography.label.fontSize,
  },
  textDisabled: {
    color: theme.colors.placeholder,
  },
}));

export const AppButton: React.FC<AppButtonProps> = ({
  style,
  disabled = false,
  title,
  onPress,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && !disabled && styles.buttonPressed,
        disabled && styles.buttonDisabled,
        style,
      ]}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <AppText
        style={[{ fontWeight: 600 }, disabled && styles.textDisabled]}
        variant="body"
        color="background"
      >
        {title}
      </AppText>
    </Pressable>
  );
};
