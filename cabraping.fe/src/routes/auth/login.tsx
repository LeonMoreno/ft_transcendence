import { Button } from "@/components/ui/button";
import { Form, redirect } from "react-router-dom";

export async function action() {
  const response = await fetch("http://localhost:3000/login", {
    method: "POST",
  });
  const data = await response.json();
  localStorage.setItem("token", JSON.stringify(data.token));
  if (data.token) return redirect("/dashboard");
  else return null;
}

export default function LoginRoute() {
  return (
    <div>
      <Form action="/login" method="POST">
        <Button type="submit">42 Login</Button>
      </Form>
    </div>
  );
}
