import type React from "react";
import { Text, type TextProps } from "react-native";
import { type Theme, makeStyles } from "../utils/styles";

export type AppTextProps = TextProps & {
  variant?: keyof Theme["typography"];
  color?: keyof Theme["colors"];
};

const styles = makeStyles((theme) => ({ ...theme.typography }));

export const AppText: React.FC<AppTextProps> = ({
  variant = "body",
  color = "text",
  style,
  ...props
}) => {
  return (
    <Text
      style={[styles[variant], { color }, style]}
      {...props}
      suppressHighlighting={true}
      allowFontScaling={false}
    />
  );
};
