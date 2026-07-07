import { redirect } from 'next/navigation';

// No landing/marketing page is in scope for this scaffold (only login,
// empresas, dashboard — see project-bootstrap frontend-setup task). The root
// route just forwards to /login so "/" doesn't 404. The real landing mockup
// (.context/design/master-design-plan.md §4.1) is unbuilt — no US in the MVP
// scope currently requires it.
export default function RootPage() {
  redirect('/login');
}
