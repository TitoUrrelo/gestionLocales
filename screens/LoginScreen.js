import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ScrollView, Pressable, Alert,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { loginUsuario } from '../control/loginControl';

export default function LoginScreen({ navigation }) {
  const { colors, isDark, toggle } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const s = makeStyles(colors);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const usuario = await loginUsuario(email, password);
      console.log('Usuario:', usuario);
      // navigation.replace('Home');
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={s.bg} contentContainerStyle={s.container}
      keyboardShouldPersistTaps="handled">

      {/* Toggle tema */}
      <View style={s.topbar}>
        <Pressable style={s.toggleBtn} onPress={toggle}>
          <Text style={s.toggleText}>{isDark ? '☾  Oscuro' : '☀  Claro'}</Text>
        </Pressable>
      </View>

      <View style={s.card}>
        <Text style={s.title}>Inicia sesión en tu cuenta</Text>

        {/* Email */}
        <Text style={s.label}>CORREO ELECTRÓNICO</Text>
        <TextInput
          style={s.input}
          placeholder="tu@correo.com"
          placeholderTextColor={colors.placeholder}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {/* Contraseña */}
        <Text style={[s.label, { marginTop: 14 }]}>CONTRASEÑA</Text>
        <View style={s.inputWrap}>
          <TextInput
            style={[s.input, { paddingRight: 48 }]}
            placeholder="••••••••"
            placeholderTextColor={colors.placeholder}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPwd}
          />
          <Pressable style={s.eyeBtn} onPress={() => setShowPwd(p => !p)}>
            <Text style={s.eyeText}>{showPwd ? '🙈' : '👁'}</Text>
          </Pressable>
        </View>

        <TouchableOpacity>
          <Text style={s.forgot}>¿Olvidaste tu contraseña?</Text>
        </TouchableOpacity>

        {/* Botón */}
        <TouchableOpacity
          style={[s.btnPrimary, loading && { opacity: 0.6 }]}
          onPress={handleLogin}
          activeOpacity={0.85}
          disabled={loading}
        >
          <Text style={s.btnPrimaryText}>
            {loading ? 'Entrando...' : 'Iniciar sesión'}
          </Text>
        </TouchableOpacity>

        {/* Divider */}
        <View style={s.divider}>
          <View style={s.dividerLine} />
          <Text style={s.dividerText}>o continúa con</Text>
          <View style={s.dividerLine} />
        </View>

        {/* Google */}
        <TouchableOpacity style={s.btnSocial} activeOpacity={0.85}>
          <Text style={s.btnSocialText}>G  Continuar con Google</Text>
        </TouchableOpacity>

        {/* Registro */}
        <View style={s.signupRow}>
          <Text style={s.signupText}>¿No tienes cuenta? </Text>
          <TouchableOpacity>
            <Text style={s.signupLink}>Regístrate gratis</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const makeStyles = (c) => StyleSheet.create({
  bg:             { flex: 1, backgroundColor: c.bg },
  container:      { alignItems: 'center', padding: 20, paddingBottom: 40, minHeight: '100%', justifyContent: 'center' },
  topbar:         { width: '100%', alignItems: 'flex-end', marginBottom: 24 },
  toggleBtn:      { backgroundColor: c.surface, borderWidth: 0.5, borderColor: c.border, borderRadius: 50, paddingHorizontal: 14, paddingVertical: 6 },
  toggleText:     { fontSize: 13, color: c.textSecondary, fontWeight: '500' },
  card:           { width: '100%', maxWidth: 400, backgroundColor: c.surface, borderWidth: 0.5, borderColor: c.border, borderRadius: 24, padding: 28 },
  logo:           { width: 40, height: 40, backgroundColor: c.btnBg, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logoText:       { color: c.btnText, fontSize: 18 },
  badge:          { alignSelf: 'flex-start', backgroundColor: c.surface2, color: c.accentText, fontSize: 11, fontWeight: '600', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginBottom: 8 },
  title:          { fontSize: 22, fontWeight: '700', color: c.textPrimary, marginBottom: 4 },
  subtitle:       { fontSize: 14, color: c.textSecondary, marginBottom: 20 },
  label:          { fontSize: 11, fontWeight: '600', color: c.textSecondary, letterSpacing: 0.8, marginBottom: 6 },
  input:          { backgroundColor: c.surface2, borderWidth: 0.5, borderColor: c.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: c.textPrimary },
  inputWrap:      { position: 'relative' },
  eyeBtn:         { position: 'absolute', right: 12, top: 10 },
  eyeText:        { fontSize: 16 },
  forgot:         { textAlign: 'right', fontSize: 13, color: c.accentText, marginTop: 8, marginBottom: 4 },
  btnPrimary:     { backgroundColor: c.btnBg, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 10 },
  btnPrimaryText: { color: c.btnText, fontSize: 15, fontWeight: '600' },
  divider:       { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 18 },
  dividerLine:   { flex: 1, height: 0.5, backgroundColor: c.border },
  dividerText:   { fontSize: 12, color: c.placeholder },
  btnSocial:     { backgroundColor: c.surface2, borderWidth: 0.5, borderColor: c.border, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  btnSocialText: { fontSize: 14, color: c.textPrimary, fontWeight: '500' },
  signupRow:      { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  signupText:     { fontSize: 14, color: c.textSecondary },
  signupLink:     { fontSize: 14, color: c.accentText, fontWeight: '600' },
});