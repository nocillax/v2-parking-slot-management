import { RegisterForm } from "@/components/auth/RegisterForm";
import { FormContainer } from "@/components/layout/FormContainer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <FormContainer>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Create an Account
          </CardTitle>
          <CardDescription>
            Join ParkEasy to start finding and reserving parking slots.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>
    </FormContainer>
  );
}
