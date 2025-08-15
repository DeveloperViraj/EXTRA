// src/components/Modals/AddGoalModal.js
import React from "react";
import { Button, Modal, Form, Input } from "antd";

function AddGoalModal({ isVisible, handleCancel, onFinish }) {
  const [form] = Form.useForm();
  return (
    <Modal
      style={{ fontWeight: 600 }}
      title="Add a New Savings Goal"
      visible={isVisible}
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
        <Form.Item style={{ fontWeight: 600 }} label="Goal Name" name="name" rules={[{ required: true, message: "Please enter the goal's name!" }]}>
          <Input type="text" className="custom-input" />
        </Form.Item>
        <Form.Item style={{ fontWeight: 600 }} label="Target Amount" name="target" rules={[{ required: true, message: "Please enter the target amount!" }]}>
          <Input type="number" className="custom-input" />
        </Form.Item>
        <Form.Item>
          {/* MODIFICATION: Using className for consistent styling */}
          <Button className="btn-primary" type="primary" htmlType="submit">
            Add Goal
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default AddGoalModal;