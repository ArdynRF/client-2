import Header from "@/components/Layout/Header";

export default function withLayout({ children }) {
  return (
    <>
      <Header />
      <div className="container">{children}</div>
    </>
  );
}
