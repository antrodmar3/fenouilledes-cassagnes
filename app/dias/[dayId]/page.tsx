import TripApp from "@/src/components/TripApp";

export default async function DayPage({ params }: { params: Promise<{ dayId: string }> }) {
  const { dayId } = await params;
  return <TripApp initialDayId={dayId} />;
}
