import { ReservationList } from "@/components/reservations/ReservationList";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function ReservationsPage() {
  return (
    <ProtectedRoute>
      <PageContainer>
        <ReservationList />
      </PageContainer>
    </ProtectedRoute>
  );
}
