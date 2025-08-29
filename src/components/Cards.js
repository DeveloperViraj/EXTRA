// src/components/Cards.js
import React, { useState } from "react";
import { Card, Row } from "antd";

function Cards({ currentBalance, income, expenses, showExpenseModal, showIncomeModal, reset }) {
  const [isIncomeBtnHovered, setIsIncomeBtnHovered] = useState(false);
  const [isExpenseBtnHovered, setIsExpenseBtnHovered] = useState(false);
  const [isResetBtnHovered, setIsResetBtnHovered] = useState(false);

  const cardStyle = {
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    borderRadius: "12px",
    background: "#fff",
    minWidth: "250px",
    flex: 1,
  };

  const baseButtonStyle = {
    width: "100%",
    padding: "10px 15px",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    border: "1px solid transparent",
    fontSize: "14px",
    textAlign: "center",
    transition: "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease",
  };

  const addBtnDefault = { ...baseButtonStyle, background: "#6366f1", color: "#fff", borderColor: "#6366f1" };
  const addBtnHover   = { ...baseButtonStyle, background: "#fff", color: "#6366f1", borderColor: "#6366f1" };
  const resetBtnDefault = { ...baseButtonStyle, background: "#fff", color: "#6366f1", borderColor: "#6366f1" };
  const resetBtnHover   = { ...baseButtonStyle, background: "#dc2626", color: "#fff", borderColor: "#dc2626" };

  return (
    <Row className="cards-row">
      <Card bordered={false} style={cardStyle}>
        <h2 style={{ marginBottom: "8px", color: "#4b5563" }}>Total Income</h2>
        <p style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "15px" }}>₹{income.toLocaleString("en-IN")}</p>
        <button
          style={isIncomeBtnHovered ? addBtnHover : addBtnDefault}
          onClick={showIncomeModal}
          onMouseEnter={() => setIsIncomeBtnHovered(true)}
          onMouseLeave={() => setIsIncomeBtnHovered(false)}
        >
          Add Income
        </button>
      </Card>

      <Card bordered={false} style={cardStyle}>
        <h2 style={{ marginBottom: "8px", color: "#4b5563" }}>Total Expenses</h2>
        <p style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "15px" }}>₹{expenses.toLocaleString("en-IN")}</p>
        <button
          style={isExpenseBtnHovered ? addBtnHover : addBtnDefault}
          onClick={showExpenseModal}
          onMouseEnter={() => setIsExpenseBtnHovered(true)}
          onMouseLeave={() => setIsExpenseBtnHovered(false)}
        >
          Add Expense
        </button>
      </Card>

      <Card bordered={false} style={cardStyle}>
        <h2 style={{ marginBottom: "8px", color: "#4b5563" }}>Current Balance</h2>
        <p style={{ fontSize: "1.5rem", fontWeight: "600", marginBottom: "15px" }}>₹{currentBalance.toLocaleString("en-IN")}</p>
        <button
          style={isResetBtnHovered ? resetBtnHover : resetBtnDefault}
          onClick={reset}
          onMouseEnter={() => setIsResetBtnHovered(true)}
          onMouseLeave={() => setIsResetBtnHovered(false)}
        >
          Reset Balance
        </button>
      </Card>
    </Row>
  );
}

export default Cards;
