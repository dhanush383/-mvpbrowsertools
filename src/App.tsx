import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { AppRoutes } from "./routes/AppRoutes";

export function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <AppRoutes />
      <Footer />
    </div>
  );
}
