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

  const titleStyle = {
    marginBottom: 8,
    color: "#4b5563",
    /* fluid, never huge on phones */
    fontSize: "clamp(14px, 4.2vw, 20px)",
    lineHeight: 1.25,
  };

  const moneyStyle = {
    fontSize: "clamp(18px, 6vw, 24px)",  // fluid amount
    fontWeight: 600,
    marginBottom: 15,
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

  const addBtnDefault   = { ...baseButtonStyle, background: "#6366f1", color: "#fff", borderColor: "#6366f1" };
  const addBtnHover     = { ...baseButtonStyle, background: "#fff", color: "#6366f1", borderColor: "#6366f1" };
  const resetBtnDefault = { ...baseButtonStyle, background: "#fff", color: "#6366f1", borderColor: "#6366f1" };
  const resetBtnHover   = { ...baseButtonStyle, background: "#dc2626", color: "#fff", borderColor: "#dc2626" };

  return (
    <Row className="cards-row">
      <Card bordered={false} style={cardStyle}>
        <h2 style={titleStyle}>Total Income</h2>
        <p className="money" style={moneyStyle}>₹{income.toLocaleString("en-IN")}</p>
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
        <h2 style={titleStyle}>Total Expenses</h2>
        <p className="money" style={moneyStyle}>₹{expenses.toLocaleString("en-IN")}</p>
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
        <h2 style={titleStyle}>Current Balance</h2>
        <p className="money" style={moneyStyle}>₹{currentBalance.toLocaleString("en-IN")}</p>
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
