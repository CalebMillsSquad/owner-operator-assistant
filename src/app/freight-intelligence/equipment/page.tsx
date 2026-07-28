import Link from "next/link";
import { createEquipmentProfile, updateEquipmentProfile } from "@/app/freight-actions";
import { prisma } from "@/lib/prisma";

const options = ["CARGO_VAN", "SPRINTER_VAN", "BOX_TRUCK_16", "BOX_TRUCK_20", "BOX_TRUCK_24", "BOX_TRUCK_26", "DRY_VAN_48", "DRY_VAN_53", "FLATBED", "PICKUP_ENCLOSED_TRAILER", "PICKUP_FLATBED_TRAILER", "POWER_ONLY", "SMALL_STRAIGHT_TRUCK", "OTHER"];
const numericFields = [["vehicleYear", "Vehicle year"], ["cargoLengthFeet", "Cargo length (ft)"], ["cargoWidthInches", "Cargo width (in)"], ["cargoHeightInches", "Cargo height (in)"], ["doorWidthInches", "Door width (in)"], ["doorHeightInches", "Door height (in)"], ["palletCapacity", "Pallet capacity"], ["maximumPayloadPounds", "Maximum payload (lb)"], ["estimatedMpg", "Estimated MPG"], ["maintenancePerMile", "Maintenance / mile"], ["insurancePerWeek", "Insurance / week"], ["paymentPerWeek", "Vehicle payment / week"], ["defaultDispatchPercent", "Default dispatch %"], ["minimumEffectiveRpm", "Minimum effective RPM"], ["minimumProjectedProfit", "Minimum projected profit"]] as const;

export const dynamic = "force-dynamic";

export default async function EquipmentPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const params = await searchParams;
  const [profiles, editing] = await Promise.all([
    prisma.equipmentProfile.findMany({ orderBy: { updatedAt: "desc" } }),
    params.edit ? prisma.equipmentProfile.findUnique({ where: { id: params.edit } }) : Promise.resolve(null),
  ]);
  const action = editing ? async (form: FormData) => { "use server"; await updateEquipmentProfile(editing.id, form); } : createEquipmentProfile;
  return <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
    <header className="mb-8"><p className="brand-kicker">Freight Intelligence</p><h1 className="mt-2 text-2xl font-bold text-[#0a2342]">Equipment profile</h1><p className="mt-1 text-sm text-[#6b7c93]">Configure known capabilities and operating assumptions used for evaluation. These are estimates, not safety authorization.</p></header>
    <form action={action} className="panel grid gap-4 p-5">
      <h2 className="text-lg font-semibold">{editing ? "Edit equipment profile" : "Add equipment profile"}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="grid gap-1 text-sm font-medium">Name<input name="name" required className="input" defaultValue={editing?.name ?? ""} /></label>
        <label className="grid gap-1 text-sm font-medium">Equipment type<select name="equipmentType" className="input" defaultValue={editing?.equipmentType ?? "OTHER"}>{options.map((option) => <option key={option} value={option}>{option.replaceAll("_", " ")}</option>)}</select></label>
        <label className="grid gap-1 text-sm font-medium">Vehicle make<input name="vehicleMake" className="input" defaultValue={editing?.vehicleMake ?? ""} /></label>
        <label className="grid gap-1 text-sm font-medium">Vehicle model<input name="vehicleModel" className="input" defaultValue={editing?.vehicleModel ?? ""} /></label>
        <label className="grid gap-1 text-sm font-medium">Unit number<input name="unitNumber" className="input" defaultValue={editing?.unitNumber ?? ""} /></label>
        {numericFields.map(([name, label]) => <label key={name} className="grid gap-1 text-sm font-medium">{label}<input name={name} type="number" step="0.01" className="input" defaultValue={editing?.[name] ?? ""} /></label>)}
      </div>
      <textarea name="notes" rows={3} className="input" placeholder="Operating assumptions and notes" defaultValue={editing?.notes ?? ""} />
      <div className="flex flex-wrap gap-3"><button className="btn-primary w-fit" type="submit">{editing ? "Save changes" : "Save equipment profile"}</button>{editing ? <Link href="/freight-intelligence/equipment" className="btn-secondary">Cancel edit</Link> : null}</div>
    </form>
    <section className="mt-6 space-y-3">{profiles.map((profile) => <div key={profile.id} className="panel p-5"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-semibold">{profile.name}</h2><p className="text-sm text-[#6b7c93]">{profile.equipmentType.replaceAll("_", " ")} · {profile.maximumPayloadPounds?.toLocaleString() ?? "Payload unknown"} lb payload · {profile.cargoLengthFeet ?? "?"} ft cargo</p></div><Link href={`/freight-intelligence/equipment?edit=${profile.id}`} className="btn-secondary">Edit</Link></div></div>)}</section>
  </div>;
}
