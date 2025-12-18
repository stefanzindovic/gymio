import { RegisterForm } from "@/components/auth/register-form";
import { RegisterRedirectWrapper } from "@/components/auth/register-redirect-wrapper";

export default function RegisterPage() {
  return (
    <RegisterRedirectWrapper>
      <RegisterForm />
    </RegisterRedirectWrapper>
  );
}
