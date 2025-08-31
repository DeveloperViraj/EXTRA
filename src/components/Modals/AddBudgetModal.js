import React from "react";
import { Modal, Form, InputNumber, Select, Button } from "antd";

const categories = [
  "Food",
  "Groceries",
  "Rent",
  "Utilities",
  "Transport",
  "Shopping",
  "Entertainment",
  "Healthcare",
  "Education",
  "Investment",
  "Other",
];

function AddBudgetModal({ isVisible, handleCancel, onFinish }) {
  const [form] = Form.useForm();

  return (
    <Modal
      title="Add Monthly Budget"
      open={isVisible}
      onCancel={handleCancel}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          onFinish(values);
          form.resetFields();
        }}
      >
        <Form.Item
          label="Category"
          name="category"
          rules={[{ required: true, message: "Please select a category!" }]}
        >
          <Select placeholder="Select category">
            {categories.map((c) => (
              <Select.Option key={c.toLowerCase()} value={c.toLowerCase()}>
                {c}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Budget Limit (₹)"
          name="limit"
          rules={[{ required: true, message: "Please enter budget limit!" }]}
        >
          <InputNumber
            min={1}
            style={{ width: "100%" }}
            placeholder="Enter amount"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="btn-primary">
            Add Budget
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default AddBudgetModal;
