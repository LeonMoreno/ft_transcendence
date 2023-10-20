import { Button } from "@/components/ui/button";
import { Form } from "react-router-dom";

export default function Home() {
  return (
    <div className="py-48 flex justify-center items-center">
      <Form action="/login" method="POST">
        <Button type="submit">42 Login</Button>
      </Form>
    </div>
  );
}
