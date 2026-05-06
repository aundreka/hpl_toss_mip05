import { Cta } from "./components/Cta";
import { Header } from "./components/Header";
import useScaleUI from "./hooks/useScaleUI";

function App() {
  const { appRef, wrapperRef } = useScaleUI(420, 820);

  return (
    <>
      <div ref={wrapperRef} className="app-wrapper">
        <div ref={appRef} className="app">
          {/* Start customizing here. */}
          {/* Please note that this template only applies to none-scrollable projects */}

          <Header className="landscape:hidden" />

          <main className="container mx-auto flex flex-col items-center p-4">
            <div className="w-full flex flex-col items-center">
              <div className="main-box w-full landscape:w-200 landscape:flex landscape:flex-row landscape:justify-center landscape:gap-4 landscape:items-center landscape:h-190">
                <div className="left-box landscape:basis-2/3">
                  <div className="p-10 bg-green-900 w-full mt-4"></div>
                  <div className="p-10 bg-green-800 w-full mt-4"></div>
                  <div className="p-10 bg-green-700 w-full mt-4"></div>
                </div>
                <div className="right-box portrait:hidden landscape:basis-1/3 flex flex-col items-center">
                  <Header />
                  <Cta />
                </div>
              </div>
            </div>
          </main>

          <Cta className="landscape:hidden" />

          {/* End customizing here */}
        </div>
      </div>
    </>
  );
}

export default App;
