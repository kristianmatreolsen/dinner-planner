import { useState } from "react";
import { View, Text, TextInput, Button } from "react-native";
import { supabase } from "../../lib/supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signIn = async () => {
    await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async () => {
    await supabase.auth.signUp({ email, password });
  };

  const resetPassword = async () => {
    await supabase.auth.resetPasswordForEmail(email);
    alert("Password reset email sent");
  };

  return (
    <View style={{ padding: 20 }}>
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} />

      <Text>Password</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />

      <Button title="Login" onPress={signIn} />
      <Button title="Register" onPress={signUp} />
      <Button title="Reset Password" onPress={resetPassword} />
    </View>
  );
}