import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type Variant = 'primary' | 'secondary';
type Size = 'small' | 'medium' | 'large';

interface BotonProps {
  onPress: () => void;
  children?: React.ReactNode;
  label?: string;
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
  variant?: Variant;
  size?: Size;
}

export const Boton: React.FC<BotonProps> = ({
  onPress,
  children,
  label,
  style,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
}) => {
  const [busy, setBusy] = useState(false);

  const handlePress = () => {
    if (busy || disabled || loading) return;
    setBusy(true);
    onPress();
    setTimeout(() => setBusy(false), 500); 
  };

  const baseStyles = [
    styles.button,
    variantStyles[variant],
    sizeStyles[size],
    disabled && styles.disabled,
    style,
  ];

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={disabled ? 1 : 0.7}
      style={baseStyles}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        typeof children !== 'undefined' ? children : <Text style={styles.label}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: '#fff',
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});

const variantStyles: Record<Variant, ViewStyle> = {
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#AAB2BD',
  },
};

const sizeStyles: Record<Size, ViewStyle & TextStyle> = {
  small: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  medium: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  large: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    fontSize: 18,
  },
};
