
import { redirect } from "next/navigation";
import { isUserLoggedIn } from "@/actions/authActions";

const { default: Login } = require("@/screens/login");

const LoginPage = ({ searchParams }) => {
if(isUserLoggedIn().value){
  console.log("User is already logged in, redirecting to home page.");
  redirect("/");
}
  return (
    <>
      <Login searchParams={searchParams} />
    </>
  );
};

export default LoginPage;
