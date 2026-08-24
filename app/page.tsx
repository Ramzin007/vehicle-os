import VehicleCard from "@/components/dashboard/vehicle-card";
import StatCard from "@/components/dashboard/stat-card";
import QuickActions from "@/components/dashboard/quick-actions";

export default function Home() {
  return (
    <div className="flex flex-col gap-5 p-5">
      <VehicleCard
        name="TVS Ronin"
        model="225 — Lightning Black"
      />

      <section className="grid grid-cols-2 gap-4">
        <StatCard
          label="Fuel"
          value="--"
          unit="L"
        />

        <StatCard
          label="Odometer"
          value="--"
          unit="km"
        />
      </section>

      <QuickActions />
    </div>
  );
}