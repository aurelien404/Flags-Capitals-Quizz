import { useTranslation } from "react-i18next";

function Home() {
  const { t } = useTranslation();
  const images = import.meta.glob("../assets/flashs/*.[wW][eE][bB][pP]", {
    eager: true,
  });
  const imagePaths = Object.values(images);
  return (
    <>
      <div className="w-full h-[2000px]">
        <div className=" bg-zzlink w-full mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 p-3 md:p-5 items-center justify-center">
          {imagePaths.map((img, index) => (
            <div className="">
              <img
                key={index}
                src={img.default}
                alt={`Flash ${index}`}
                className="w-full rounded-xs"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;
