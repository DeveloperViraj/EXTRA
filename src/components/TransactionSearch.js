// src/components/TransactionSearch.js
import React, { useState } from "react";
import { Table, Select, Radio, Input } from "antd";
import search from "../assets/search.svg";
import { parse } from "papaparse";
import { toast } from "react-toastify";

const { Option } = Select;

const TransactionSearch = ({
  transactions,
  exportToCsv,
  addTransaction,
  fetchTransactions,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sortKey, setSortKey] = useState("");

  function importFromCsv(event) {
    event.preventDefault();
    try {
      parse(event.target.files[0], {
        header: true,
        complete: async function (results) {
          for (const transaction of results.data) {
            const newTransaction = {
              ...transaction,
              amount: parseInt(transaction.amount),
            };
            await addTransaction(newTransaction, true);
          }
        },
      });
      toast.success("All Transactions Added");
      fetchTransactions();
      event.target.files = null;
    } catch (e) {
      toast.error(e.message);
    }
  }

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Type", dataIndex: "type", key: "type" },
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    { title: "Tag", dataIndex: "tag", key: "tag" },
  ];

  const filteredTransactions = transactions.filter((transaction) => 
    transaction.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (typeFilter ? transaction.type === typeFilter : true)
  );

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortKey === "date") return new Date(b.date) - new Date(a.date);
    if (sortKey === "amount") return b.amount - a.amount;
    return 0;
  });

  const dataSource = sortedTransactions.map((transaction, index) => ({
    key: index,
    ...transaction,
  }));

  // --- Style Definitions for Buttons ---
  const baseButtonStyle = {
    padding: "8px 15px",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
    border: "1px solid transparent",
    fontSize: '14px',
    textAlign: 'center',
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
  };
  
  const exportButtonStyle = {
    ...baseButtonStyle,
    background: "#fff",
    color: "#6366f1",
    borderColor: "#6366f1",
  };

  const importButtonStyle = {
    ...baseButtonStyle,
    background: "#6366f1",
    color: "#fff",
  };

  return (
    <div style={{ margin: "0 2rem 2rem 2rem", padding: "1.5rem", background: "#fff", borderRadius: "16px", boxShadow: "0 6px 24px rgba(0,0,0,.06)"}}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "center", marginBottom: "1.5rem" }}>
        <div className="input-flex">
          <img src={search} width="16" alt="search icon" />
          <Input placeholder="Search by Name" onChange={(e) => setSearchTerm(e.target.value)} bordered={false} />
        </div>
        <Select
          className="select-input"
          onChange={(value) => setTypeFilter(value)}
          value={typeFilter || "all"}
          placeholder="Filter"
          allowClear
        >
          <Option value="">All</Option>
          <Option value="income">Income</Option>
          <Option value="expense">Expense</Option>
        </Select>
      </div>

      <div className="my-table">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: '1.2rem' }}>My Transactions</h2>
          <Radio.Group className="input-radio" onChange={(e) => setSortKey(e.target.value)} value={sortKey}>
            <Radio.Button value="">No Sort</Radio.Button>
            <Radio.Button value="date">Sort by Date</Radio.Button>
            <Radio.Button value="amount">Sort by Amount</Radio.Button>
          </Radio.Group>
        <div className="action-buttons" style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
          <button style={exportButtonStyle} onClick={exportToCsv}>Export to CSV</button>
          <label htmlFor="file-csv" style={importButtonStyle}>Import from CSV</label>
          <input onChange={importFromCsv} id="file-csv" type="file" accept=".csv" required style={{ display: "none" }} />
        </div>

        </div>
        <Table columns={columns} dataSource={dataSource} scroll={{ x: true }} />

      </div>
    </div>
  );
};

export default TransactionSearch;