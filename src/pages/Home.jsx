import { useTranslation } from "react-i18next";

function Home() {
  const { t } = useTranslation();
  const images = import.meta.glob("../assets/flashs/*.[wW][eE][bB][pP]", {
    eager: true,
  });
  const imagePaths = Object.values(images);
  return (
    <>
      <h1>Hello</h1>
    </>
  );
}

export default Home;
