// src/components/Dashboard.js
import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { Modal, Row, Col } from "antd";
import { PlusCircle, Trash2 } from "lucide-react";

// Component Imports
import TransactionSearch from "./TransactionSearch";
import Header from "./Header";
import Cards from "./Cards";
import NoTransactions from "./NoTransactions";
import Loader from "./Loader";
import "../responsive.css";

// Modal Imports
import AddIncomeModal from "./Modals/AddIncome";
import AddExpenseModal from "./Modals/AddExpense";
import AddGoalContributionModal from "./Modals/AddGoalContributionModal";
import AddGoalModal from "./Modals/AddGoalModal";

// Firebase Imports
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { addDoc, collection, getDocs, query, writeBatch } from "firebase/firestore";

// Utility Imports
import { toast } from "react-toastify";
import { unparse } from "papaparse";

// Icon & Chart Imports
import {
  TrendingUp,
  Wallet,
  PiggyBank,
  Receipt,
  Target,
  Sparkles,
  Gauge,
  PieChart as PieIcon,
  ArrowDownCircle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";

/* ----------------------------- helpers ------------------------------ */
const COLORS = ["#6366f1", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#22c55e"];
const currency = (v) =>
  `₹${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const cardShell = {
  borderRadius: 16,
  padding: 16,
  background: "white",
  border: "1px solid rgba(0,0,0,.06)",
  boxShadow: "0 6px 24px rgba(0,0,0,.06)",
};

const sectionTitle = (Icon, title, onAdd) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
      marginBottom: 8,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ padding: 8, borderRadius: 12, background: "rgba(0,0,0,.05)" }}>
        <Icon size={18} />
      </div>
      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>{title}</h2>
    </div>
    {onAdd && (
      <PlusCircle
        size={20}
        style={{ cursor: "pointer", color: "#6366f1" }}
        onClick={onAdd}
      />
    )}
  </div>
);

/* ------------------------------ UI bits ---------------------------------- */
function KpiCard({ icon: Icon, label, value, delta }) {
  const isUp = (delta ?? 0) >= 0;
  return (
    <div style={cardShell}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ color: "#6b7280", fontSize: 13 }}>{label}</div>
        <div style={{ padding: 8, borderRadius: 12, background: "rgba(0,0,0,.05)" }}>
          <Icon size={18} />
        </div>
      </div>
      <div style={{ marginTop: 6, fontSize: 24, fontWeight: 800 }}>{currency(value)}</div>
      {typeof delta === "number" ? (
        <div
          style={{
            marginTop: 4,
            fontSize: 12,
            fontWeight: 600,
            color: isUp ? "#059669" : "#dc2626",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <TrendingUp
            size={16}
            style={{ transform: isUp ? "rotate(0deg)" : "rotate(180deg)" }}
          />
          {(isUp ? "+" : "") + delta.toFixed(1)}% vs last month
        </div>
      ) : (
        <div style={{ height: "18px", marginTop: "4px" }}></div>
      )}
    </div>
  );
}

function BudgetBar({ name, spent, limit }) {
  const pct = Math.min(100, Math.round((spent / Math.max(1, limit)) * 100));
  const over = spent > limit;
  return (
    <div style={cardShell}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div style={{ fontWeight: 600 }}>{name}</div>
        <div style={{ fontSize: 13, color: over ? "#dc2626" : "#6b7280" }}>
          {currency(spent)} / {currency(limit)}
        </div>
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: "#e5e7eb",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: over ? "#ef4444" : "#6366f1",
            borderRadius: 999,
            transition: "width .3s ease",
          }}
        />
      </div>
    </div>
  );
}

function SavingsGoalCard({ name, saved, target, onContribute, onDelete }) {
  const pct = Math.min(100, Math.round((saved / Math.max(1, target)) * 100));
  return (
    <div style={cardShell}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 14 }}>{name}</div>
        <Trash2
          size={16}
          style={{ cursor: "pointer", color: "#9ca3af", flexShrink: 0 }}
          onClick={onDelete}
        />
      </div>
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
        {currency(saved)} / {currency(target)}
      </div>
      <div
        style={{
          height: 8,
          borderRadius: 999,
          background: "#e5e7eb",
          overflow: "hidden",
          marginBottom: 12,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "#10b981",
            borderRadius: 999,
            transition: "width .3s ease",
          }}
        />
      </div>
      <button className="btn-secondary" onClick={onContribute}>
        Add Contribution
      </button>
    </div>
  );
}

function TransactionsTable({ rows = [] }) {
  return (
    <div style={{ ...cardShell, overflow: "hidden", height: "100%" }}>
      <div
        style={{
          padding: "12px 16px",
          fontSize: 13,
          fontWeight: 700,
          borderBottom: "1px solid #eee",
        }}
      >
        Recent Transactions
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", minWidth: "600px" }}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Tag</th>
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.type}</td>
                  <td>{r.when}</td>
                  <td>{currency(r.amount)}</td>
                  <td>{r.tag || "—"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "16px" }}>
                  No recent transactions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function InsightCard({ icon: Icon, title, value, hint }) {
  return (
    <div style={{ ...cardShell, padding: 14 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 6,
        }}
      >
        <div style={{ padding: 8, borderRadius: 10, background: "rgba(0,0,0,.05)" }}>
          <Icon size={16} />
        </div>
        <div style={{ fontWeight: 700 }}>{title}</div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{value}</div>
      <div
        style={{
          fontSize: 12,
          color: "#6b7280",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {hint}
      </div>
    </div>
  );
}

/* --------------------------------- main component ----------------------------------- */
const Dashboard = () => {
  const [user] = useAuthState(auth);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isExpenseModalVisible, setIsExpenseModalVisible] = useState(false);
  const [isIncomeModalVisible, setIsIncomeModalVisible] = useState(false);
  const [isGoalModalVisible, setIsGoalModalVisible] = useState(false);
  const [isAddGoalModalVisible, setIsAddGoalModalVisible] = useState(false);

  const [selectedGoal, setSelectedGoal] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [incomeSum, setIncomeSum] = useState(0);
  const [expensesSum, setExpensesSum] = useState(0);
  const [savingsGoals, setSavingsGoals] = useState([
    { id: "goal1", name: "iPhone 16 Pro", saved: 0, target: 140000 },
    { id: "goal2", name: "Goa Trip", saved: 0, target: 40000 },
  ]);

  /* --------------------------- derived datasets --------------------------- */
  // monthlyBudgets, last12, monthlyIE, categories, kpis, insightData, tableRows
  // (KEEP all your existing useMemo logic here — unchanged)
    /* --------------------------- derived datasets --------------------------- */
  const monthlyBudgets = useMemo(
    () => [
      {
        name: "Food",
        spent: transactions
          .filter((t) => t.tag === "food")
          .reduce((s, t) => s + Number(t.amount), 0),
        limit: 10000,
      },
      {
        name: "Travel",
        spent: transactions
          .filter((t) => t.tag === "travel")
          .reduce((s, t) => s + Number(t.amount), 0),
        limit: 8000,
      },
      {
        name: "Shopping",
        spent: transactions
          .filter((t) => t.tag === "shopping")
          .reduce((s, t) => s + Number(t.amount), 0),
        limit: 5000,
      },
    ],
    [transactions]
  );

  const last12 = useMemo(() => {
    const arr = [];
    for (let i = 11; i >= 0; i--) {
      arr.push(moment().subtract(i, "months").format("MMM YY"));
    }
    return arr;
  }, []);

  const monthlyIE = useMemo(() => {
    const map = {};
    last12.forEach((m) => (map[m] = { income: 0, expense: 0, m }));
    transactions.forEach((t) => {
      const m = moment(t.date).format("MMM YY");
      if (!map[m]) return;
      if (t.type === "income") map[m].income += Number(t.amount);
      if (t.type === "expense" || t.type === "goal")
        map[m].expense += Number(t.amount);
    });
    return Object.values(map);
  }, [transactions, last12]);

  const categories = useMemo(() => {
    const cats = {};
    transactions
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        cats[t.tag] = (cats[t.tag] || 0) + Number(t.amount);
      });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const kpis = useMemo(() => {
    const lastMonth = moment().subtract(1, "months").format("MM");
    const lastMonthTx = transactions.filter(
      (t) => moment(t.date).format("MM") === lastMonth
    );
    const lastIncome = lastMonthTx
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + Number(t.amount), 0);
    const lastExpense = lastMonthTx
      .filter((t) => t.type === "expense" || t.type === "goal")
      .reduce((s, t) => s + Number(t.amount), 0);

    return [
      { key: "bal", label: "Balance", value: currentBalance, icon: Wallet },
      {
        key: "inc",
        label: "Income",
        value: incomeSum,
        delta: lastIncome ? ((incomeSum - lastIncome) / lastIncome) * 100 : null,
        icon: TrendingUp,
      },
      {
        key: "exp",
        label: "Expenses",
        value: expensesSum,
        delta: lastExpense
          ? ((expensesSum - lastExpense) / lastExpense) * 100
          : null,
        icon: Receipt,
      },
      {
        key: "sav",
        label: "Savings",
        value: currentBalance,
        delta:
          lastIncome && lastExpense
            ? (((incomeSum - expensesSum) - (lastIncome - lastExpense)) /
                (lastIncome - lastExpense)) *
              100
            : null,
        icon: PiggyBank,
      },
    ];
  }, [transactions, currentBalance, incomeSum, expensesSum]);

  const insightData = useMemo(() => {
    const thisMonth = moment().format("MM");
    const thisMonthTx = transactions.filter(
      (t) => moment(t.date).format("MM") === thisMonth
    );

    const income = thisMonthTx
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + Number(t.amount), 0);
    const expense = thisMonthTx
      .filter((t) => t.type === "expense" || t.type === "goal")
      .reduce((s, t) => s + Number(t.amount), 0);

    const cats = {};
    thisMonthTx
      .filter((t) => t.type === "expense")
      .forEach((t) => {
        cats[t.tag] = (cats[t.tag] || 0) + Number(t.amount);
      });

    const topCategory = Object.entries(cats).sort((a, b) => b[1] - a[1])[0] || [
      "—",
      0,
    ];

    const largestExpense = thisMonthTx
      .filter((t) => t.type === "expense")
      .sort((a, b) => b.amount - a.amount)[0];

    return {
      savingsRate: income ? (income - expense) / income : 0,
      thisMonthSav: income - expense,
      topCategory,
      largestExpense,
    };
  }, [transactions]);

  const tableRows = useMemo(() => {
    return transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map((t) => ({
        id: t.id,
        who: t.name,
        when: moment(t.date).format("DD MMM YYYY"),
        amount: Number(t.amount),
        type: t.type,
      }));
  }, [transactions]);


  /* ------------------------------ data ops ------------------------------- */
  useEffect(() => {
    if (user) fetchTransactions();
  }, [user]);

  useEffect(() => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + Number(t.amount), 0);
    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + Number(t.amount), 0);
    const totalGoalContributions = transactions
      .filter((t) => t.type === "goal")
      .reduce((s, t) => s + Number(t.amount), 0);

    setIncomeSum(totalIncome);
    setExpensesSum(totalExpenses);
    setCurrentBalance(totalIncome - totalExpenses - totalGoalContributions);

    // update savings goals progress
    const goalProgress = {};
    savingsGoals.forEach((g) => (goalProgress[g.name] = 0));
    transactions
      .filter((t) => t.type === "goal")
      .forEach((t) => {
        const goalName = t.name.replace("Contribution to ", "");
        if (goalProgress.hasOwnProperty(goalName)) {
          goalProgress[goalName] += Number(t.amount);
        }
      });
    setSavingsGoals((prev) =>
      prev.map((g) => ({ ...g, saved: goalProgress[g.name] || 0 }))
    );
  }, [transactions]);

  async function fetchTransactions() {
    setLoading(true);
    if (user) {
      const q = query(collection(db, `users/${user.uid}/transactions`));
      const querySnapshot = await getDocs(q);
      setTransactions(querySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    }
    setLoading(false);
  }

  async function addTransaction(transaction) {
    if (!user) return toast.error("You must be logged in.");
    try {
      await addDoc(collection(db, `users/${user.uid}/transactions`), transaction);
      toast.success("Transaction Added!");
      fetchTransactions();
    } catch (e) {
      toast.error("Couldn't add transaction.");
    }
  }

  const onFinish = (values, type) => {
    const tag = Array.isArray(values.tag) ? values.tag[0] : values.tag;
    const newTransaction = {
      type,
      date: moment(values.date).format("YYYY-MM-DD"),
      amount: parseFloat(values.amount),
      tag,
      name: values.name,
    };
    addTransaction(newTransaction);
    setIsExpenseModalVisible(false);
    setIsIncomeModalVisible(false);
  };

  const onGoalContributionFinish = (values) => {
    const amount = parseFloat(values.amount);
    addTransaction({
      type: "goal",
      date: moment().format("YYYY-MM-DD"),
      amount,
      name: `Contribution to ${selectedGoal.name}`,
      tag: "Savings Goal",
    });
    toast.success(`Contribution to ${selectedGoal.name} saved!`);
    setIsGoalModalVisible(false);
  };

  const handleAddGoal = (values) => {
    const newGoal = {
      id: `goal_${Date.now()}`,
      name: values.name,
      target: parseFloat(values.target),
      saved: 0,
    };
    setSavingsGoals([...savingsGoals, newGoal]);
    toast.success("New goal added!");
    setIsAddGoalModalVisible(false);
  };

  const handleDeleteGoal = (goalToDelete) => {
    Modal.confirm({
      title: "Delete Goal",
      content: `Are you sure you want to delete the goal "${goalToDelete.name}"?`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        setLoading(true);
        const goalContributionName = `Contribution to ${goalToDelete.name}`;
        const batch = writeBatch(db);
        const q = query(collection(db, `users/${user.uid}/transactions`));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
          if (doc.data().name === goalContributionName) batch.delete(doc.ref);
        });
        await batch.commit();
        setSavingsGoals(savingsGoals.filter((g) => g.id !== goalToDelete.id));
        fetchTransactions();
        toast.success(`Goal "${goalToDelete.name}" deleted.`);
      },
    });
  };

  const handleReset = () => {
    Modal.confirm({
      title: "Reset Balance",
      content: "Are you sure you want to delete ALL transactions?",
      okText: "Yes, Reset Everything",
      okType: "danger",
      onOk: async () => {
        setLoading(true);
        const batch = writeBatch(db);
        const q = query(collection(db, `users/${user.uid}/transactions`));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        setTransactions([]);
        toast.success("All transactions have been reset.");
        setLoading(false);
      },
    });
  };

  function exportToCsv() {
    const csv = unparse(transactions, {
      fields: ["name", "type", "date", "amount", "tag"],
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /* ------------------------------ render ---------------------------------- */
  return (
    <div className="dashboard-container">
      <Header />
      {loading ? (
        <Loader />
      ) : (
        <>
          <Cards
            currentBalance={currentBalance}
            income={incomeSum}
            expenses={expensesSum}
            showExpenseModal={() => setIsExpenseModalVisible(true)}
            showIncomeModal={() => setIsIncomeModalVisible(true)}
            reset={handleReset}
          />

          {/* Modals */}
          <AddIncomeModal
            isIncomeModalVisible={isIncomeModalVisible}
            handleIncomeCancel={() => setIsIncomeModalVisible(false)}
            onFinish={onFinish}
          />
          <AddExpenseModal
            isExpenseModalVisible={isExpenseModalVisible}
            handleExpenseCancel={() => setIsExpenseModalVisible(false)}
            onFinish={onFinish}
          />
          <AddGoalModal
            isVisible={isAddGoalModalVisible}
            handleCancel={() => setIsAddGoalModalVisible(false)}
            onFinish={handleAddGoal}
          />
          {selectedGoal && (
            <AddGoalContributionModal
              isVisible={isGoalModalVisible}
              handleCancel={() => setIsGoalModalVisible(false)}
              onFinish={onGoalContributionFinish}
              goalName={selectedGoal.name}
            />
          )}

          {transactions.length === 0 ? (
            <NoTransactions />
          ) : (
            <div style={{ maxWidth: 1200, margin: "24px auto 0", padding: "0 16px" }}>
              {/* KPI Cards */}
              <Row gutter={[16, 16]}>
                {kpis.map((k) => (
                  <Col xs={24} sm={12} md={12} lg={6} key={k.key}>
                    <KpiCard {...k} />
                  </Col>
                ))}
              </Row>

              {/* Cashflow + Spending */}
              <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={16}>
                  <div style={cardShell}>
                    {sectionTitle(Gauge, "Cashflow (Last 12 months)")}
                    <div style={{ height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={monthlyIE}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <defs>
                            <linearGradient id="inc" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                          <XAxis dataKey="m" />
                          <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                          <Tooltip formatter={(v) => currency(v)} />
                          <Area
                            type="monotone"
                            dataKey="income"
                            stroke="#22c55e"
                            fill="url(#inc)"
                            strokeWidth={2}
                          />
                          <Area
                            type="monotone"
                            dataKey="expense"
                            stroke="#ef4444"
                            fill="url(#exp)"
                            strokeWidth={2}
                          />
                          <Legend />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Col>
                <Col xs={24} lg={8}>
                  <div style={cardShell}>
                    {sectionTitle(PieIcon, "Spending by Category")}
                    <div style={{ height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categories}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                          >
                            {categories.map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(v) => currency(v)} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Transactions + Net Savings */}
              <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={16}>
                  <TransactionsTable rows={tableRows} />
                </Col>
                <Col xs={24} lg={8}>
                  <div style={cardShell}>
                    {sectionTitle(TrendingUp, "Net Savings Trend")}
                    <div style={{ height: 260 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={monthlyIE.map((d) => ({
                            m: d.m,
                            v: Math.max(0, d.income - d.expense),
                          }))}
                        >
                          <XAxis dataKey="m" />
                          <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                          <Tooltip formatter={(v) => currency(v)} />
                          <Bar dataKey="v" fill="#6366f1" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Budgets + Goals */}
              <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={12}>
                  {sectionTitle(Target, "Monthly Budgets")}
                  <Row gutter={[12, 12]}>
                    {monthlyBudgets.map(
                      (b) =>
                        b.limit > 0 && (
                          <Col xs={24} sm={12} key={b.name}>
                            <BudgetBar {...b} />
                          </Col>
                        )
                    )}
                  </Row>
                </Col>
                <Col xs={24} lg={12}>
                  {sectionTitle(PiggyBank, "Savings Goals", () =>
                    setIsAddGoalModalVisible(true)
                  )}
                  <Row gutter={[12, 12]}>
                    {savingsGoals.map((g) => (
                      <Col xs={24} sm={12} key={g.id}>
                        <SavingsGoalCard
                          {...g}
                          onContribute={() => {
                            setSelectedGoal(g);
                            setIsGoalModalVisible(true);
                          }}
                          onDelete={() => handleDeleteGoal(g)}
                        />
                      </Col>
                    ))}
                  </Row>
                </Col>
              </Row>

              {/* Insights */}
              <div style={{ marginTop: 24, marginBottom: 24 }}>
                {sectionTitle(Sparkles, "Smart Insights")}
                <Row gutter={[12, 12]}>
                  <Col xs={24} sm={12} md={8}>
                    <InsightCard
                      icon={PiggyBank}
                      title="Savings Rate"
                      value={`${Math.round(insightData.savingsRate * 100)}%`}
                      hint={`Saved ${currency(insightData.thisMonthSav)} this month`}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <InsightCard
                      icon={Receipt}
                      title="Top Category"
                      value={insightData.topCategory[0]}
                      hint={currency(insightData.topCategory[1])}
                    />
                  </Col>
                  <Col xs={24} sm={12} md={8}>
                    <InsightCard
                      icon={ArrowDownCircle}
                      title="Largest Expense"
                      value={
                        insightData.largestExpense
                          ? currency(insightData.largestExpense.amount)
                          : "—"
                      }
                      hint={
                        insightData.largestExpense?.name ||
                        "No expenses this month"
                      }
                    />
                  </Col>
                </Row>
              </div>
            </div>
          )}
          <TransactionSearch
            transactions={transactions}
            exportToCsv={exportToCsv}
            fetchTransactions={fetchTransactions}
            addTransaction={addTransaction}
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
