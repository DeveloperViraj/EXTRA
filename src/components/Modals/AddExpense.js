// src/components/Modals/AddExpense.js
import React from "react";
import { Button, Modal, Form, Input, DatePicker, Select } from "antd";

function AddExpenseModal({ isExpenseModalVisible, handleExpenseCancel, onFinish }) {
  const [form] = Form.useForm();
  return (
    <Modal
      style={{ fontWeight: 600 }}
      title="Add Expense"
      visible={isExpenseModalVisible}
      onCancel={handleExpenseCancel}
      footer={null}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => {
          onFinish({ ...values, tag: values.tag[0] }, "expense");
          form.resetFields();
        }}
      >
        <Form.Item style={{ fontWeight: 600 }} label="Name" name="name" rules={[{ required: true, message: "Please input the name of the transaction!" }]}>
          <Input type="text" className="custom-input" />
        </Form.Item>
        <Form.Item style={{ fontWeight: 600 }} label="Amount" name="amount" rules={[{ required: true, message: "Please input the expense amount!" }]}>
          <Input type="number" className="custom-input" />
        </Form.Item>
        <Form.Item style={{ fontWeight: 600 }} label="Date" name="date" rules={[{ required: true, message: "Please select the expense date!" }]}>
          <DatePicker className="custom-input" format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item label="Tag" name="tag" style={{ fontWeight: 600 }} rules={[{ required: true, message: "Please select or add a tag!" }]}>
          <Select className="select-input-2" mode="tags" placeholder="Select or create a tag">
            <Select.Option value="food">Food</Select.Option>
            <Select.Option value="groceries">Groceries</Select.Option>
            <Select.Option value="rent">Rent</Select.Option>
            <Select.Option value="utilities">Utilities</Select.Option>
            <Select.Option value="transport">Transport</Select.Option>
            <Select.Option value="shopping">Shopping</Select.Option>
            <Select.Option value="entertainment">Entertainment</Select.Option>
            <Select.Option value="healthcare">Healthcare</Select.Option>
            <Select.Option value="education">Education</Select.Option>
            <Select.Option value="investment">Investment</Select.Option>
            <Select.Option value="other">Other</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          {/* MODIFICATION: Using className for consistent styling */}
          <Button className="btn-primary" type="primary" htmlType="submit">
            Add Expense
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default AddExpenseModal;