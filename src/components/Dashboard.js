import React, { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { Modal } from "antd";
import { PlusCircle, Trash2 } from "lucide-react";

import "./Dashboard.css";
import TransactionSearch from "./TransactionSearch";
import Header from "./Header";
import Cards from "./Cards";
import NoTransactions from "./NoTransactions";
import Loader from "./Loader";

import AddIncomeModal from "./Modals/AddIncome";
import AddExpenseModal from "./Modals/AddExpense";
import AddGoalContributionModal from "./Modals/AddGoalContributionModal";
import AddGoalModal from "./Modals/AddGoalModal";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { addDoc, collection, getDocs, query, writeBatch } from "firebase/firestore";

import { toast } from "react-toastify";
import { unparse } from "papaparse";

import {
  TrendingUp, Wallet, PiggyBank, Receipt, Target, Sparkles,
  Gauge, PieChart as PieIcon, ArrowDownCircle,
} from "lucide-react";
import {
  AreaChart, Area, PieChart, Pie, Cell, Tooltip, XAxis, YAxis,
  ResponsiveContainer, CartesianGrid, Legend, BarChart, Bar,
} from "recharts";

/* ----------------------------- helpers ------------------------------ */
const COLORS = ["#6366f1", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6", "#22c55e"];
const currency = (v) => `₹${Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const cardShell = {
  borderRadius: 16,
  padding: 16,
  background: "white",
  border: "1px solid rgba(0,0,0,.06)",
  boxShadow: "0 6px 24px rgba(0,0,0,.06)",
};

const sectionTitle = (Icon, title, onAdd) => (
  <div className="section-title">
    <div className="section-title__left">
      <div className="section-title__icon"><Icon size={18} /></div>
      <h2 className="section-title__text">{title}</h2>
    </div>
    {onAdd && <PlusCircle size={20} className="section-title__action" onClick={onAdd} />}
  </div>
);

const stack = useIsMobile(1200);   // stack everything under 1200px

function useIsMobile(bp = 576) {
  const [isMobile, setIsMobile] = useState(typeof window !== "undefined" ? window.innerWidth <= bp : false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia(`(max-width:${bp}px)`);
    const on = (e) => setIsMobile(e.matches);
    try { mq.addEventListener("change", on); } catch { mq.addListener(on); }
    return () => { try { mq.removeEventListener("change", on); } catch { mq.removeListener(on); } };
  }, [bp]);
  return isMobile;
}

/* ------------------------------ UI bits ---------------------------------- */
function KpiCard({ icon: Icon, label, value, delta }) {
  const isUp = (delta ?? 0) >= 0;
  return (
    <div style={cardShell}>
      <div className="kpi-head">
        <div className="kpi-label">{label}</div>
        <div className="kpi-icon"><Icon size={18} /></div>
      </div>
      <div className="kpi-value">{currency(value)}</div>
      {typeof delta === "number" ? (
        <div className={`kpi-delta ${isUp ? "up" : "down"}`}>
          <TrendingUp size={16} style={{ transform: isUp ? "rotate(0deg)" : "rotate(180deg)" }} />
          {(isUp ? "+" : "") + delta.toFixed(1)}% vs last month
        </div>
      ) : <div style={{ height: 18, marginTop: 4 }} />}
    </div>
  );
}

function BudgetBar({ name, spent, limit }) {
  const pct = Math.min(100, Math.round((spent / Math.max(1, limit)) * 100));
  const over = spent > limit;
  return (
    <div style={cardShell}>
      <div className="budget-head">
        <div className="budget-name">{name}</div>
        <div className={`budget-amount ${over ? "over" : ""}`}>
          {currency(spent)} / {currency(limit)}
        </div>
      </div>
      <div className="budget-bar">
        <div className={`budget-bar__fill ${over ? "over" : ""}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function SavingsGoalCard({ name, saved, target, onContribute, onDelete }) {
  const pct = Math.min(100, Math.round((saved / Math.max(1, target)) * 100));
  return (
    <div style={cardShell}>
      <div className="goal-head">
        <div className="goal-name">{name}</div>
        <Trash2 size={16} className="goal-delete" onClick={onDelete} />
      </div>
      <div className="goal-amount">
        {currency(saved)} / {currency(target)}
      </div>
      <div className="budget-bar">
        <div className="budget-bar__fill success" style={{ width: `${pct}%` }} />
      </div>
      <button className="btn-secondary" onClick={onContribute}>Add Contribution</button>
    </div>
  );
}

function TransactionsTable({ rows = [] }) {
  return (
    <div style={{ ...cardShell, overflow: "hidden", height: "100%" }}>
      <div className="table-title">Recent Transactions</div>
      {rows.length > 0 ? rows.map((r) => (
        <div key={r.id} className="tx-row">
          <div className="tx-left">
            <div className={`tx-dot ${r.amount < 0 ? (r.type.toLowerCase().includes("goal") ? "warn" : "neg") : "pos"}`} />
            <div>
              <div className="tx-name">{r.who}</div>
              <div className="tx-meta">{r.when} • {r.type}</div>
            </div>
          </div>
          <div className={`tx-amt ${r.amount < 0 ? (r.type.toLowerCase().includes("goal") ? "warn" : "neg") : "pos"}`}>
            {r.amount < 0 ? "-" : "+"} {currency(Math.abs(r.amount))}
          </div>
        </div>
      )) : <div className="tx-empty">No recent transactions.</div>}
    </div>
  );
}

function InsightCard({ icon: Icon, title, value, hint }) {
  return (
    <div style={{ ...cardShell, padding: 14 }}>
      <div className="ins-head">
        <div className="ins-icon"><Icon size={16} /></div>
        <div className="ins-title">{title}</div>
      </div>
      <div className="ins-value">{value}</div>
      <div className="ins-hint">{hint}</div>
    </div>
  );
}

/* --------------------------------- main ----------------------------------- */
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

  const isMobile = useIsMobile(576);

  /* --------------------------- derived datasets --------------------------- */
  const monthlyBudgets = useMemo(() => {
    const BUDGET_LIMITS = { food: 20000, groceries: 15000, transport: 8000, shopping: 10000, entertainment: 5000, utilities: 7000 };
    const spentThisMonth = {};
    Object.keys(BUDGET_LIMITS).forEach((k) => (spentThisMonth[k] = 0));
    const currentMonthKey = moment().format("YYYY-MM");
    transactions
      .filter((t) => t.type === "expense" && moment(t.date).format("YYYY-MM") === currentMonthKey)
      .forEach((t) => { if (spentThisMonth.hasOwnProperty(t.tag)) spentThisMonth[t.tag] += Number(t.amount) || 0; });
    return Object.keys(BUDGET_LIMITS).map((tag) => ({
      name: tag.charAt(0).toUpperCase() + tag.slice(1),
      spent: spentThisMonth[tag],
      limit: BUDGET_LIMITS[tag],
    }));
  }, [transactions]);

  const last12 = useMemo(
    () => [...Array(12)].map((_, i) => moment().subtract(11 - i, "months"))
                         .map((m) => ({ key: m.format("YYYY-MM"), label: m.format("MMM") })),
    []
  );

  const monthlyIE = useMemo(() => {
    const map = Object.fromEntries(last12.map((m) => [m.key, { income: 0, expense: 0 }]));
    transactions.forEach((t) => {
      const key = moment(t.date).format("YYYY-MM");
      if (!map[key]) return;
      if (t.type === "income") map[key].income += Number(t.amount) || 0;
      else if (t.type === "expense") map[key].expense += Number(t.amount) || 0;
    });
    return last12.map((m) => ({ m: m.label, income: map[m.key].income, expense: map[m.key].expense }));
  }, [transactions, last12]);

  const categories = useMemo(() => {
    const agg = {};
    transactions.filter((t) => t.type === "expense").forEach((t) => {
      const key = t.tag || "Other";
      agg[key] = (agg[key] || 0) + (Number(t.amount) || 0);
    });
    return Object.entries(agg).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const kpis = useMemo(() => {
    const thisKey = moment().format("YYYY-MM");
    const prevKey = moment().subtract(1, "month").format("YYYY-MM");
    const sumFor = (key, type) =>
      transactions.filter((t) => moment(t.date).format("YYYY-MM") === key && t.type === type)
                  .reduce((s, t) => s + (Number(t.amount) || 0), 0);
    const incNow = sumFor(thisKey, "income");
    const incPrev = sumFor(prevKey, "income");
    const expNow = sumFor(thisKey, "expense");
    const expPrev = sumFor(prevKey, "expense");
    const savNow = Math.max(0, incNow - expNow);
    const savPrev = Math.max(0, incPrev - expPrev);
    const pct = (now, prev) => (prev > 0 ? ((now - prev) / prev) * 100 : now > 0 ? 100 : 0);
    return [
      { key: "income", label: "Income", value: incNow, delta: pct(incNow, incPrev), icon: Wallet },
      { key: "expense", label: "Expenses", value: expNow, delta: pct(expNow, expPrev), icon: Receipt },
      { key: "savings", label: "Savings", value: savNow, delta: pct(savNow, savPrev), icon: PiggyBank },
      { key: "net", label: "This Month's Net", value: incNow - expNow, icon: Target },
    ];
  }, [transactions]);

  const insightData = useMemo(() => {
    const thisMonth = transactions.filter((t) => moment(t.date).isSame(moment(), "month"));
    const inc = thisMonth.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount || 0), 0);
    const exp = thisMonth.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount || 0), 0);
    const sav = Math.max(0, inc - exp);
    const savingsRate = inc > 0 ? sav / inc : 0;
    const topCategory = Object.entries(
      (categories || []).reduce((acc, cur) => ({ ...acc, [cur.name]: cur.value }), {})
    ).sort((a, b) => b[1] - a[1])[0] || ["—", 0];
    const largestExpense = thisMonth.filter((t) => t.type === "expense")
      .sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0))[0];
    return { savingsRate, topCategory, largestExpense, thisMonthSav: sav };
  }, [transactions, categories]);

  const tableRows = useMemo(
    () => [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4)
      .map((t, idx) => ({
        id: t.id || idx,
        when: moment(t.date).format("MMM DD"),
        who: t.name,
        type: t.tag,
        amount: t.type === "expense" || t.type === "goal" ? -Math.abs(t.amount) : Math.abs(t.amount),
      })),
    [transactions]
  );

  /* ------------------------------ data ops ------------------------------- */
  useEffect(() => { if (user) fetchTransactions(); }, [user]);

  useEffect(() => {
    const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + Number(t.amount), 0);
    const totalExpenses = transactions.filter(t => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
    const totalGoalContributions = transactions.filter(t => t.type === "goal").reduce((s, t) => s + Number(t.amount), 0);
    setIncomeSum(totalIncome);
    setExpensesSum(totalExpenses);
    setCurrentBalance(totalIncome - totalExpenses - totalGoalContributions);

    const goalProgress = {};
    savingsGoals.forEach(g => (goalProgress[g.name] = 0));
    transactions.filter(t => t.type === "goal").forEach(t => {
      const goalName = t.name.replace("Contribution to ", "");
      if (goalProgress.hasOwnProperty(goalName)) goalProgress[goalName] += Number(t.amount);
    });
    setSavingsGoals(prev => prev.map(g => ({ ...g, saved: goalProgress[g.name] || 0 })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactions]);

  async function fetchTransactions() {
    setLoading(true);
    if (user) {
      const q = query(collection(db, `users/${user.uid}/transactions`));
      const snapshot = await getDocs(q);
      setTransactions(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }
    setLoading(false);
  }

  async function addTransaction(transaction) {
    if (!user) return toast.error("You must be logged in.");
    try {
      await addDoc(collection(db, `users/${user.uid}/transactions`), transaction);
      toast.success("Transaction Added!");
      fetchTransactions();
    } catch {
      toast.error("Couldn't add transaction.");
    }
  }

  const onFinish = (values, type) => {
    const tag = Array.isArray(values.tag) ? values.tag[0] : values.tag;
    addTransaction({
      type,
      date: moment(values.date).format("YYYY-MM-DD"),
      amount: parseFloat(values.amount),
      tag,
      name: values.name,
    });
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
    setSavingsGoals(prev => [...prev, { id: `goal_${Date.now()}`, name: values.name, target: parseFloat(values.target), saved: 0 }]);
    toast.success("New goal added!");
    setIsAddGoalModalVisible(false);
  };

  const handleDeleteGoal = (goalToDelete) => {
    Modal.confirm({
      title: "Delete Goal",
      content: `Are you sure you want to delete the goal "${goalToDelete.name}"? All contributions will be returned to your balance.`,
      okText: "Delete",
      okType: "danger",
      onOk: async () => {
        setLoading(true);
        const goalContributionName = `Contribution to ${goalToDelete.name}`;
        const batch = writeBatch(db);
        const q = query(collection(db, `users/${user.uid}/transactions`));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => { if (doc.data().name === goalContributionName) batch.delete(doc.ref); });
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
      content: "Are you sure you want to delete ALL transactions? This action cannot be undone.",
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
    const csv = unparse(transactions, { fields: ["name", "type", "date", "amount", "tag"] });
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
      {loading ? <Loader /> : (
        <>
          <Cards
            currentBalance={currentBalance}
            income={incomeSum}
            expenses={expensesSum}
            showExpenseModal={() => setIsExpenseModalVisible(true)}
            showIncomeModal={() => setIsIncomeModalVisible(true)}
            reset={handleReset}
            stack={stack}
          />

          <AddIncomeModal isIncomeModalVisible={isIncomeModalVisible} handleIncomeCancel={() => setIsIncomeModalVisible(false)} onFinish={onFinish} />
          <AddExpenseModal isExpenseModalVisible={isExpenseModalVisible} handleExpenseCancel={() => setIsExpenseModalVisible(false)} onFinish={onFinish} />
          <AddGoalModal isVisible={isAddGoalModalVisible} handleCancel={() => setIsAddGoalModalVisible(false)} onFinish={handleAddGoal} />
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
  <div className="dash-wrap">
    {/* KPIs */}
    <div
      className="kpi-grid"
      style={stack ? { gridTemplateColumns: "1fr" } : undefined}
    >
      {kpis.map((k) => (
        <KpiCard key={k.key} {...k} />
      ))}
    </div>

    {/* Charts row */}
    <div
      className="grid-2-1"
      style={stack ? { gridTemplateColumns: "1fr" } : undefined}
    >
      <div style={{ ...cardShell, minWidth: 0 }}>
        {sectionTitle(Gauge, "Cashflow (Last 12 months)")}
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={monthlyIE}
              margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
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
              <XAxis dataKey="m" tick={{ fontSize: isMobile ? 10 : 12 }} />
              <YAxis
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
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
              {!isMobile && <Legend wrapperStyle={{ fontSize: 12 }} />}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ ...cardShell, minWidth: 0 }}>
        {sectionTitle(PieIcon, "Spending by Category")}
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categories}
                dataKey="value"
                nameKey="name"
                innerRadius={isMobile ? 40 : 60}
                outerRadius={isMobile ? 70 : 90}
                paddingAngle={3}
              >
                {categories.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => currency(v)} />
              {!isMobile && <Legend wrapperStyle={{ fontSize: 12 }} />}
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    {/* Transactions + Net Savings */}
    <div
      className="grid-2-1"
      style={stack ? { gridTemplateColumns: "1fr" } : undefined}
    >
      <TransactionsTable rows={tableRows} />

      <div style={{ ...cardShell, minWidth: 0 }}>
        {sectionTitle(TrendingUp, "Net Savings Trend")}
        <div className="chart-box">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyIE.map((d) => ({
                m: d.m,
                v: Math.max(0, d.income - d.expense),
              }))}
              margin={{ top: 8, right: 8, left: -10, bottom: 0 }}
            >
              <XAxis dataKey="m" tick={{ fontSize: isMobile ? 10 : 12 }} />
              <YAxis
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <Tooltip formatter={(v) => currency(v)} />
              <Bar dataKey="v" fill="#6366f1" />
              {!isMobile && <Legend wrapperStyle={{ fontSize: 12 }} />}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    {/* Budgets + Goals */}
    <div
      className="budgets-goals"
      style={stack ? { gridTemplateColumns: "1fr" } : undefined}
    >
      <div style={{ minWidth: 0 }}>
        {sectionTitle(Target, "Monthly Budgets")}
        <div
          className="budgets-grid"
          style={stack ? { gridTemplateColumns: "1fr" } : undefined}
        >
          {monthlyBudgets.map(
            (b) => b.limit > 0 && <BudgetBar key={b.name} {...b} />
          )}
        </div>
      </div>

      <div style={{ minWidth: 0 }}>
        {sectionTitle(PiggyBank, "Savings Goals", () =>
          setIsAddGoalModalVisible(true)
        )}
        <div
          className="goals-grid"
          style={stack ? { gridTemplateColumns: "1fr" } : undefined}
        >
          {savingsGoals.map((g) => (
            <SavingsGoalCard
              key={g.id}
              {...g}
              onContribute={() => {
                setSelectedGoal(g);
                setIsGoalModalVisible(true);
              }}
              onDelete={() => handleDeleteGoal(g)}
            />
          ))}
        </div>
      </div>
    </div>

    {/* Insights */}
    <div style={{ marginBottom: 24 }}>
      {sectionTitle(Sparkles, "Smart Insights")}
      <div
        className="insights-grid"
        style={stack ? { gridTemplateColumns: "1fr" } : undefined}
      >
        <InsightCard
          icon={PiggyBank}
          title="Savings Rate"
          value={`${Math.round(insightData.savingsRate * 100)}%`}
          hint={`Saved ${currency(insightData.thisMonthSav)} this month`}
        />
        <InsightCard
          icon={Receipt}
          title="Top Category"
          value={insightData.topCategory[0]}
          hint={currency(insightData.topCategory[1])}
        />
        <InsightCard
          icon={ArrowDownCircle}
          title="Largest Expense"
          value={
            insightData.largestExpense
              ? currency(insightData.largestExpense.amount)
              : "—"
          }
          hint={insightData.largestExpense?.name || "No expenses this month"}
        />
      </div>
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
