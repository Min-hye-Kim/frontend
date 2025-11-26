import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
  matchPath,
} from "react-router-dom";
import "./App.css";
//Layout
import MainLayout from "./layouts/MainLayout";
import UploadLayout from "./layouts/UploadLayout";
import BackLayout from "./layouts/BackLayout";
//Home
import HomePage from "./pages/HomePage";
//Login, Signup, Profile
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SignupCompletePage from "./pages/SignupCompletePage";
import ProfilePage from "./pages/ProfilePage";
//Scrapbook
import ScrapbookPage from "./pages/ScrapbookPage";
//Budget
import BudgetPage from "./pages/BudgetPage";
//Accountbook
import AccountbookPage from "./pages/AccountbookPage";
//AcctSummary
import AcctSummaryLoading from "./pages/AcctSummaryLoading";
import AcctSummaryComplete from "./pages/AcctSummaryComplete";
import AcctSummaryProfileData from "./pages/AcctSummaryProfileData";
import AcctSummaryPage from "./pages/AcctSummaryPage";
import AcctSummaryProfileEdit from "./pages/AcctSummaryProfileEdit";

function App() {
  return (
    <>
      <Router>
        <Routes>
          {/* NavTopbar(네비게이션) */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Navigate to="/home" replace />} />{" "}
            {/* 기본 경로를 /home으로 리다이렉트 */}
            <Route path="/home" element={<HomePage />} />
            <Route path="/scrapbook" element={<ScrapbookPage />} />
            <Route path="/budget" element={<BudgetPage />} />
            <Route path="/accountbook" element={<AccountbookPage />} />
            <Route path="/summaries/snapshot/:id" element={<AcctSummaryPage />} />
          </Route>

          {/* UploadTopbar(뒤로가기+게시하기) */}
          <Route element={<UploadLayout />}>
            <Route path="/summaries/loading" element={<AcctSummaryLoading />} />
            <Route path="/summaries/profile" element={<AcctSummaryProfileData />} />
            <Route path="/summaries/edit" element={<AcctSummaryProfileEdit />} />
          </Route>

          {/* BackTopbar(뒤로가기) */}
          <Route element={<BackLayout />}>
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/profile" element={<ProfilePage/>} />
          </Route>

          {/* Topbar X */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup/complete" element={<SignupCompletePage/>}/>
          <Route path="/summaries/complete" element={<AcctSummaryComplete />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
