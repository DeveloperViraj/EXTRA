// src/components/Modals/AddGoalContributionModal.js
import React from "react";
import { Button, Modal, Form, Input } from "antd";

function AddGoalContributionModal({ isVisible, handleCancel, onFinish, goalName }) {
  const [form] = Form.useForm();
  return (
    <Modal
      style={{ fontWeight: 600 }}
      title={`Contribute to ${goalName}`}
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
        <Form.Item style={{ fontWeight: 600 }} label="Amount" name="amount" rules={[{ required: true, message: "Please input the contribution amount!" }]}>
          <Input type="number" className="custom-input" />
        </Form.Item>
        <Form.Item>
          {/* MODIFICATION: Using className for consistent styling */}
          <Button className="btn-primary" htmlType="submit">
            Save Contribution
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default AddGoalContributionModal;