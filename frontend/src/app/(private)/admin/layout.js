import AdminShell from "./AdminShell";

export const metadata = {
  title: {
    template: "%s | Admin | TriageList",
    default: "Admin Dashboard | TriageList",
  },
  description: "Administrative dashboard for TriageList",
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
