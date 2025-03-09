"use client";
import { useSelector, useDispatch } from "react-redux";
import { counterSlice } from "~/lib/features/slices/counter";
import styles from "./styles.module.scss";
import { Button, Input } from "antd-mobile";

const { increment, decrement } = counterSlice.actions;
export default function Counter() {
  const count = useSelector(
    (state: { counter: { value: number } }) => state.counter.value,
  );
  const dispatch = useDispatch();

  const handleIncrement = () => {
    dispatch(increment());
  };

  const handleDecrement = () => {
    dispatch(decrement());
  };

  return (
    <div className={styles.counter}>
      <h1>Redux Counter</h1>
      <h1 className="primaryColor">Hello, Next.js!</h1>
      <div>
        <Button
          color="primary"
          aria-label="Increment value"
          onClick={handleIncrement}
        >
          Increment
        </Button>
        <Input
          placeholder="请输入验证码"
          style={{
            "--text-align": "center",
            "--font-size": "20px",
            "--color": "red",
            border: "1px solid blue",
            margin: "10px 0",
          }}
          clearable
          readOnly
          value={count.toString()}
        />
        <Button
          color="danger"
          aria-label="Decrement value"
          onClick={handleDecrement}
        >
          Decrement
        </Button>
      </div>
    </div>
  );
}
