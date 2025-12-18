import { LoginForm } from "@/components/auth/login-form";
import { LoginRedirectWrapper } from "@/components/auth/login-redirect-wrapper";

export default function LoginPage() {
  return (
    <LoginRedirectWrapper>
      <LoginForm />
    </LoginRedirectWrapper>
  );
}
