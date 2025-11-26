import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../hooks";
import NavTopbar from "../components/topbar/NavTopbar";
import {
  createLedgerItem,
  updateLedgerItem,
  deleteLedgerItem,
  getDateLedgers,
  getCategoryLedgers,
  getThisMonthLedgers,
  getTotalMonthLedgers,
} from "../apis/ledgers/ledgers";
import TransactionEdit from "../components/TransactionEdit";
import TransactionItem from "../components/TransactionItem";
import CategoryCard from "../components/CategoryCard";
import CircleButton from "../components/button/CircleButton";
import Button from "../components/button/SquareButton";

const AccountbookPage = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();

  // 모달에서 사용할 TransactionEdit ref
  const editFormRef = React.useRef(null);

  // 지출 or 수입?
  const [transactionType, setTransactionType] = useState("expense");
  const [viewType, setViewType] = useState("daily");

  // TransactionEdit 컴포넌트 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  // 거래 내역 리스트
  const [transactions, setTransactions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    // 하드코딩했던 것 삭제함
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  });
  const [isSummaryPublished, setIsSummaryPublished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, [viewType, selectedMonth]);

  const fetchAllData = async () => {
    try {
      setLoading(true);

      if (viewType === "daily") {
        const dateResponse = await getDateLedgers();
        if (dateResponse && dateResponse.data) {
          // API 데이터 구조 그대로 저장
          setDailyData(dateResponse.data);

          const allTransactions = [];
          dateResponse.data.forEach((monthData) => {
            monthData.days?.forEach((dayData) => {
              dayData.items?.forEach((item) => {
                allTransactions.push({
                  id: item.id,
                  entry_type: item.entry_type,
                  date: item.date,
                  payment_method: item.payment_method,
                  category: item.category,
                  amount: parseFloat(item.amount),
                  currency_code: item.currency_code,
                  amount_converted: parseFloat(item.amount_converted),
                  converted_currency_code: item.converted_currency_code,
                });
              });
            });
          });
          setTransactions(allTransactions);
        }
      } else {
        const categoryResponse = await getCategoryLedgers();
        if (categoryResponse && categoryResponse.data) {
          const data = categoryResponse.data;

          // 카테고리별 조회 시 → 거래내역이 : 개별로는 X, 덩어리(?)로만 O / transactions는 기존 데이터 유지
          if (data.categories) {
            setCategoryData(data.categories);
          }
          if (data.living_expense) {
            setLivingExpense(data.living_expense);
          }
          if (data.living_expense_budget_diff) {
            setLivingExpenseBudgetDiff(data.living_expense_budget_diff);
          }
          if (data.base_dispatch_cost) {
            setBaseDispatchCost(data.base_dispatch_cost);
          }
        }
      }

      // 이번달
      const thisMonthResponse = await getThisMonthLedgers();
      if (thisMonthResponse && thisMonthResponse.data) {
        const data = thisMonthResponse.data;
        setMonthlyExpense({
          foreign_amount: parseFloat(data.expense?.foreign_amount || 0),
          foreign_currency: data.expense?.foreign_currency || "USD",
          krw_amount: parseFloat(data.expense?.krw_amount || 0),
        });
        setMonthlyIncome({
          foreign_amount: parseFloat(data.income?.foreign_amount || 0),
          foreign_currency: data.income?.foreign_currency || "USD",
          krw_amount: parseFloat(data.income?.krw_amount || 0),
        });
      }

      // 총기간
      const totalMonthResponse = await getTotalMonthLedgers();
      if (totalMonthResponse && totalMonthResponse.data) {
        const data = totalMonthResponse.data;
        setTotalExpense({
          foreign_amount: parseFloat(data.expense?.foreign_amount || 0),
          foreign_currency: data.expense?.foreign_currency || "USD",
          krw_amount: parseFloat(data.expense?.krw_amount || 0),
        });
        setTotalIncome({
          foreign_amount: parseFloat(data.income?.foreign_amount || 0),
          foreign_currency: data.income?.foreign_currency || "USD",
          krw_amount: parseFloat(data.income?.krw_amount || 0),
        });
      }

      setLoading(false);
    } catch (error) {
      console.error("거래내역 조회 실패", error);
      setLoading(false);
    }
  };

  const [monthlyExpense, setMonthlyExpense] = useState({
    foreign_amount: 0,
    foreign_currency: "USD",
    krw_amount: 0,
  });
  const [monthlyIncome, setMonthlyIncome] = useState({
    foreign_amount: 0,
    foreign_currency: "USD",
    krw_amount: 0,
  });

  const [totalExpense, setTotalExpense] = useState({
    foreign_amount: 0,
    foreign_currency: "USD",
    krw_amount: 0,
  });
  const [totalIncome, setTotalIncome] = useState({
    foreign_amount: 0,
    foreign_currency: "USD",
    krw_amount: 0,
  });

  const [baseDispatchCost, setBaseDispatchCost] = useState({
    airfare: {
      foreign_amount: 0,
      foreign_currency: "USD",
      krw_amount: 0,
      krw_currency: "KRW",
    },
    insurance: {
      foreign_amount: 0,
      foreign_currency: "USD",
      krw_amount: 0,
      krw_currency: "KRW",
    },
    visa: {
      foreign_amount: 0,
      foreign_currency: "USD",
      krw_amount: 0,
      krw_currency: "KRW",
    },
    tuition: {
      foreign_amount: 0,
      foreign_currency: "USD",
      krw_amount: 0,
      krw_currency: "KRW",
    },
    total: {
      foreign_amount: 0,
      foreign_currency: "USD",
      krw_amount: 0,
      krw_currency: "KRW",
    },
  });

  const [categoryData, setCategoryData] = useState([]);
  const [livingExpense, setLivingExpense] = useState(null);
  const [livingExpenseBudgetDiff, setLivingExpenseBudgetDiff] = useState(null);
  const [dailyData, setDailyData] = useState([]);

  const handleMonthPrev = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    setSelectedMonth(`${prevYear}-${String(prevMonth).padStart(2, "0")}`);
  };

  const handleMonthNext = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    setSelectedMonth(`${nextYear}-${String(nextMonth).padStart(2, "0")}`);
  };

  const handlePublish = () => {
    // API: POST /summaries/snapshot/ (가계부 요약본 등록)
    // 세부 프로필 데이터를 포함하여 POST 요청으로 API 연결하면 되겠다
    navigate("/summaries/loading");
  };

  const handleOpenModal = (transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  // API: POST /ledgers/fill/ (등록)
  const handleRegisterTransaction = async (data) => {
    if (!data) {
      alert("모든 필수 항목을 입력해주세요.");
      return;
    }

    try {
      const response = await createLedgerItem(data);
      if (response && response.data) {
        // 등록 성공 후 데이터 다시 가져오기
        await fetchAllData();
      }
    } catch (error) {
      console.error("거래내역 등록 실패", error);
    }
  };

  // API: PUT /ledgers/fill/<int:ledger_id>/ (수정)
  const handleSaveTransaction = async (data) => {
    if (!data || !editingTransaction) return;

    try {
      const response = await updateLedgerItem(editingTransaction.id, data);
      if (response && response.data) {
        await fetchAllData();
        handleCloseModal();
      }
    } catch (error) {
      console.error("거래내역 수정 실패", error);
    }
  };

  // API: DELETE /ledgers/fill/<int:ledger_id>/
  const handleDeleteTransaction = async (id) => {
    if (!id) return;

    try {
        await deleteLedgerItem(id);
        handleCloseModal();
        await fetchAllData();
        } catch (error) {
      console.error("거래내역 삭제 실패", error);
      }
  };

  // 내 게시글 ㄱㄱ
  const handleGoToMyPost = () => {
    // API: GET /summaries/snapshot/<int:snapshot_id>/
    navigate("/summaries/snapshot");
  };

  // 일별 daily 뷰
  const renderDailyTransactions = () => {
    // API에서 받아온 dailyData 사용
    if (dailyData && dailyData.length > 0) {
      const monthData = dailyData.find((data) => data.month === selectedMonth);

      if (!monthData || !monthData.days || monthData.days.length === 0) {
        return <EmptyMessage>이번 달 거래 내역이 없습니다.</EmptyMessage>;
      }

      return monthData.days.map((dayData) => (
        <DateGroup key={dayData.date}>
          <DateHeader>
            <DateDay>{new Date(dayData.date).getDate()}일</DateDay>
            <DateWeekday>{dayData.weekday_ko}</DateWeekday>
          </DateHeader>
          <TransactionItemsWrapper>
            {dayData.items?.map((item) => {
              const transaction = {
                id: item.id,
                entry_type: item.entry_type,
                date: item.date,
                payment_method: item.payment_method,
                category: item.category,
                amount: parseFloat(item.amount),
                currency_code: item.currency_code,
                amount_converted: parseFloat(item.amount_converted),
                converted_currency_code: item.converted_currency_code,
              };
              return (
                <TransactionItem
                  key={item.id}
                  transaction={transaction}
                  onClick={() => handleOpenModal(transaction)}
                />
              );
            })}
          </TransactionItemsWrapper>
        </DateGroup>
      ));
    }

    // API 데이터 ㅌ 폴백: transactions를 날짜별로 묶어둠
    const grouped = {};
    transactions
      .filter((t) => t.date && t.date.startsWith(selectedMonth))
      .forEach((transaction) => {
        const date = transaction.date;
        if (!grouped[date]) {
          grouped[date] = {
            items: [],
            weekday_ko: ["일", "월", "화", "수", "목", "금", "토"][
              new Date(date).getDay()
            ],
          };
        }
        grouped[date].items.push(transaction);
      });

    const sortedDates = Object.keys(grouped).sort(
      (a, b) => new Date(b) - new Date(a)
    );

    if (sortedDates.length === 0) {
      return <EmptyMessage>거래 내역이 없습니다.</EmptyMessage>;
    }

    return sortedDates.map((date) => (
      <DateGroup key={date}>
        <DateHeader>
          <DateDay>{new Date(date).getDate()}일</DateDay>
          <DateWeekday>{grouped[date].weekday_ko}</DateWeekday>
        </DateHeader>
        <TransactionItemsWrapper>
          {grouped[date].items.map((transaction) => (
            <TransactionItem
              key={transaction.id}
              transaction={transaction}
              onClick={() => handleOpenModal(transaction)}
            />
          ))}
        </TransactionItemsWrapper>
      </DateGroup>
    ));
  };

  // 카테고리별 데이터 반환 (선택된 월 필터링)
  const getCategoryDataForMonth = () => {
    // API에서 받아온 categoryData가 있으면 그거 쓰기
    if (categoryData && categoryData.length > 0) {
      return categoryData;
    }

    // API 데이터가 없으면? 로컬 집계로,, (폴백)
    const categoryMap = {};
    const categoryLabels = {
      FOOD: "식비",
      HOUSING: "주거비",
      TRANSPORT: "교통비",
      SHOPPING: "쇼핑비",
      TRAVEL: "여행비",
      STUDY_MATERIALS: "교재비",
      ALLOWANCE: "용돈",
      ETC: "기타",
    };

    transactions
      .filter((t) => t.entry_type === "EXPENSE")
      .filter((t) => t.date && t.date.startsWith(selectedMonth))
      .forEach((transaction) => {
        const category = transaction.category;
        if (!categoryMap[category]) {
          categoryMap[category] = {
            code: category,
            label: categoryLabels[category] || category,
            foreign_amount: 0,
            foreign_currency: transaction.currency_code,
            krw_amount: 0,
            krw_currency: "KRW",
            budget_diff: null,
          };
        }
        categoryMap[category].foreign_amount += parseFloat(
          transaction.amount || 0
        );
        categoryMap[category].krw_amount += parseFloat(
          transaction.amount_converted || 0
        );
      });

    return Object.values(categoryMap);
  };

  // 카테고리별 뷰 렌더링
  const renderCategoryView = () => {
    const displayCategoryData = getCategoryDataForMonth();

    if (displayCategoryData.length === 0) {
      return (
        <EmptySection>
          <EmptyMessage>카테고리별 지출 내역이 없습니다.</EmptyMessage>
        </EmptySection>
      );
    }

    // API에서 받아온 생활비 데이터 사용하고 없으면 로컬 계산으로,,
    const totalSpent = livingExpense?.foreign_amount
      ? parseFloat(livingExpense.foreign_amount)
      : displayCategoryData.reduce(
          (sum, cat) => sum + parseFloat(cat.foreign_amount || 0),
          0
        );
    const totalSpentKRW = livingExpense?.krw_amount
      ? parseFloat(livingExpense.krw_amount)
      : displayCategoryData.reduce(
          (sum, cat) => sum + parseFloat(cat.krw_amount || 0),
          0
        );
    const foreignCurrency =
      livingExpense?.foreign_currency ||
      displayCategoryData[0]?.foreign_currency ||
      "USD";

    return (
      <>
        {/* 이번달 생활비 */}
        <CategoryHeader>
          <CategoryTitle>이번달 생활비</CategoryTitle>
          <CategoryAmount>
            {foreignCurrency === "KRW" ? "₩" : "$"}
            {totalSpent.toFixed(2)} (₩{totalSpentKRW.toLocaleString()})
          </CategoryAmount>
        </CategoryHeader>

        {/* 예산 차이 메시지 */}
        {livingExpenseBudgetDiff && (
          <BudgetMessage>
            예산대비
            <BudgetMessageAmount>
              {" "}
              {livingExpenseBudgetDiff.foreign_currency === "KRW" ? "₩" : "$"}
              {Math.abs(
                parseFloat(livingExpenseBudgetDiff.foreign_amount)
              ).toFixed(2)}{" "}
              {parseFloat(livingExpenseBudgetDiff.foreign_amount) >= 0
                ? "더 적게"
                : "더 많이"}{" "}
            </BudgetMessageAmount>
            썼어요!
          </BudgetMessage>
        )}

        {/* 카테고리별 카드 */}
        <CategoryCardsGrid>
          {displayCategoryData.map((category) => (
            <CategoryCard key={category.code} categoryData={category} />
          ))}
        </CategoryCardsGrid>
        <BasicCostSection>
          <BasicCostHeader>
            <BasicCostTitle>기본파견비용</BasicCostTitle>
            <BasicCostAmount>
              {baseDispatchCost.total.foreign_currency === "KRW" ? "₩" : "$"}
              {parseFloat(baseDispatchCost.total.foreign_amount).toFixed(2)} (₩
              {parseFloat(baseDispatchCost.total.krw_amount).toLocaleString()})
            </BasicCostAmount>
          </BasicCostHeader>
          <BasicCostGrid>
            {[
              {
                code: "airfare",
                label: "항공권",
                ...baseDispatchCost.airfare,
                budget_diff: null,
              },
              {
                code: "insurance",
                label: "보험료",
                ...baseDispatchCost.insurance,
                budget_diff: null,
              },
              {
                code: "visa",
                label: "비자",
                ...baseDispatchCost.visa,
                budget_diff: null,
              },
              {
                code: "tuition",
                label: "등록금",
                ...baseDispatchCost.tuition,
                budget_diff: null,
              },
            ].map((cost) => (
              <CategoryCard key={cost.code} categoryData={cost} />
            ))}
          </BasicCostGrid>
        </BasicCostSection>
      </>
    );
  };

  return (
    <>
      <NavTopbar />
      <PageContainer>
        <PageTitle>가계부</PageTitle>
        <Wrapper>
          <MainContent>
            {/* TransactionEdit : 걍 컴포넌트 만들었음.. */}
            {isModalOpen && (
              <ModalOverlay onClick={handleCloseModal}>
                <ModalContent onClick={(e) => e.stopPropagation()}>
                  <TransactionEdit
                    ref={editFormRef}
                    initialData={editingTransaction}
                    onSave={handleSaveTransaction}
                    onDelete={handleDeleteTransaction}
                    onClose={handleCloseModal}
                  />
                  <ModalButtonContainer>
                    <Button
                      onClick={() =>
                        handleDeleteTransaction(editingTransaction?.id)
                      }
                      customStyle={`
                        width: 100%;
                        height: 2.53125rem;
                        border-radius: 0.52734375rem;
                        background: var(--light-gray, #d9d9d9);
                        color: var(--black, #000);
                        font-size: 0.925rem;
                        font-weight: 500;
                      `}
                    >
                      <span className="h3">삭제하기</span>
                    </Button>
                    <Button
                      onClick={() => editFormRef.current?.handleSave()}
                      customStyle={`
                        width: 100%;
                        height: 2.53125rem;
                        border-radius: 0.52734375rem;
                        background: var(--blue, #115bca);
                        color: var(--white, #ffffff);
                        font-size: 0.925rem;
                        font-weight: 500;
                      `}
                    >
                      <span className="h3">수정사항 저장하기</span>
                    </Button>
                  </ModalButtonContainer>
                </ModalContent>
              </ModalOverlay>
            )}
            {/* 거래 등록 영역 */}
            <TransactionEditContainer>
              <TransactionEdit
                initialData={null}
                onSave={handleRegisterTransaction}
                onDelete={null}
                onClose={null}
              />
            </TransactionEditContainer>
            <DateAndTabRow>
              <DateSelector>
                <DateButton onClick={handleMonthPrev}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    viewBox="0 0 25 25"
                    fill="none"
                  >
                    <path
                      d="M15 5L8 12.5L15 20"
                      stroke="var(--gray, #a5a5a5)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </DateButton>

                <DateDisplay>
                  <h2>{selectedMonth.split("-")[1]}월</h2>
                </DateDisplay>

                <DateButton onClick={handleMonthNext}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="25"
                    height="25"
                    viewBox="0 0 25 25"
                    fill="none"
                  >
                    <path
                      d="M10 20L17 12.5L10 5"
                      stroke="var(--gray, #a5a5a5)"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </DateButton>
              </DateSelector>

              <TabContainer>
                <CircleButton
                  onClick={() => setViewType("daily")}
                  customStyle={`
              width: 5.625rem;
              height: 2.484375rem;
              background: ${
                viewType === "daily"
                  ? "var(--blue, #115bca)"
                  : "var(--white, #ffffff)"
              };
              color: ${
                viewType === "daily"
                  ? "var(--white, #ffffff)"
                  : "var(--black, #000)"
              };
              border: ${
                viewType === "daily"
                  ? "none"
                  : "0.046875rem solid var(--light-gray, #d9d9d9)"
              };
              font-size: 0.925rem;
            `}
                >
                  일별
                </CircleButton>
                <CircleButton
                  onClick={() => setViewType("category")}
                  customStyle={`
              width: 5.625rem;
              height: 2.484375rem;
              background: ${
                viewType === "category"
                  ? "var(--blue, #115bca)"
                  : "var(--white, #ffffff)"
              };
              color: ${
                viewType === "category"
                  ? "var(--white, #ffffff)"
                  : "var(--black, #000)"
              };
              border: ${
                viewType === "category"
                  ? "none"
                  : "0.046875rem solid var(--light-gray, #d9d9d9)"
              };
              font-size: 0.925rem;
            `}
                >
                  카테고리별
                </CircleButton>
              </TabContainer>
            </DateAndTabRow>{" "}
            {/* 가계부 내역.. 인데 없으면 뭐라고 할 지 딱히 안적어두셔서 */}
            {viewType === "daily" ? (
              <TransactionList>
                {loading ? (
                  <EmptyMessage>로딩 중...</EmptyMessage>
                ) : (
                  <DailyViewContainer>
                    {renderDailyTransactions()}
                  </DailyViewContainer>
                )}
              </TransactionList>
            ) : (
              <CategoryViewContainer>
                {renderCategoryView()}
              </CategoryViewContainer>
            )}
          </MainContent>

          {/* ————————————————————————————— 사이드(?) ————————————————————————————— */}
          <Sidebar>
            {/* 이번달 수입/지출 */}
            <SummaryCard>
              <SummaryTitle>이번달 수입/지출</SummaryTitle>
              <SummaryContent>
                <SummaryRow>
                  <SummaryLabel>지출</SummaryLabel>
                  <SummaryValues>
                    <SummaryValue $type="expense">
                      - {monthlyExpense.foreign_currency === "KRW" ? "₩" : "$"}
                      {monthlyExpense.foreign_amount.toFixed(2)}
                    </SummaryValue>
                    <SummarySubValue>
                      - ₩{monthlyExpense.krw_amount.toLocaleString()}
                    </SummarySubValue>
                  </SummaryValues>
                </SummaryRow>
                <SummaryRow>
                  <SummaryLabel>수입</SummaryLabel>
                  <SummaryValues>
                    <SummaryValue $type="income">
                      + {monthlyIncome.foreign_currency === "KRW" ? "₩" : "$"}
                      {monthlyIncome.foreign_amount.toFixed(2)}
                    </SummaryValue>
                    <SummarySubValue>
                      + ₩{monthlyIncome.krw_amount.toLocaleString()}
                    </SummarySubValue>
                  </SummaryValues>
                </SummaryRow>
              </SummaryContent>
            </SummaryCard>

            {/* 파견기간내 수입/지출 */}
            <SummaryCard>
              <SummaryTitle>파견기간내 수입/지출</SummaryTitle>
              <SummaryContent>
                <SummaryRow>
                  <SummaryLabel>지출</SummaryLabel>
                  <SummaryValues>
                    <SummaryValue $type="expense">
                      - {totalExpense.foreign_currency === "KRW" ? "₩" : "$"}
                      {totalExpense.foreign_amount.toFixed(2)}
                    </SummaryValue>
                    <SummarySubValue>
                      - ₩{totalExpense.krw_amount.toLocaleString()}
                    </SummarySubValue>
                  </SummaryValues>
                </SummaryRow>
                <SummaryRow>
                  <SummaryLabel>수입</SummaryLabel>
                  <SummaryValues>
                    <SummaryValue $type="income">
                      + {totalIncome.foreign_currency === "KRW" ? "₩" : "$"}
                      {totalIncome.foreign_amount.toFixed(2)}
                    </SummaryValue>
                    <SummarySubValue>
                      + ₩{totalIncome.krw_amount.toLocaleString()}
                    </SummarySubValue>
                  </SummaryValues>
                </SummaryRow>
              </SummaryContent>
            </SummaryCard>

            {/* 게시하기 / 내 게시글 바로가기 버튼 */}
            <ButtonGroup>
              <Button
                onClick={handlePublish}
                disabled={transactions.length === 0 || isSummaryPublished}
                customStyle={`
              width: 100%;
              height: 3.609375rem;
              padding: 1.078125rem 1.5rem;
              border-radius: 0.97744rem;
              font-size: 1.125rem;
              background: ${
                transactions.length === 0 || isSummaryPublished
                  ? "var(--gray, #a5a5a5)"
                  : "var(--blue, #115bca)"
              };
            `}
              >
                <span className="h3">내 가계부 요약본 게시하기</span>
              </Button>

              <Button
                onClick={handleGoToMyPost}
                disabled={!isSummaryPublished}
                customStyle={`
              width: 100%;
              height: 3.609375rem;
              padding: 1.078125rem 1.5rem;
              border-radius: 0.97744rem;
              font-size: 1.125rem;
              background: ${
                isSummaryPublished
                  ? "var(--blue, #115bca)"
                  : "var(--gray, #a5a5a5)"
              };
            `}
              >
                <span className="h3">내 게시글 바로가기</span>
              </Button>
            </ButtonGroup>
          </Sidebar>
        </Wrapper>
      </PageContainer>
    </>
  );
};

export default AccountbookPage;

//
// ————————————————————— 스타일링 —————————————————————

const PageContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PageTitle = styled.h2`
  width: 100%;
  max-width: calc(38rem + 2rem + 16rem);
  color: var(--black, #000);
  text-align: left;
  margin-bottom: 1.5rem;
`;

const Wrapper = styled.div`
  width: 100%;
  max-width: calc(38rem + 2rem + 16rem);
  margin: 0 auto;
  min-height: calc(100vh - 5.5rem - 1.25rem);
  display: grid;
  grid-template-columns: 45fr 32fr;
  gap: 2rem;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  h2 {
    color: var(--black, #000);
    text-align: left;
    margin-bottom: 0.5rem;
  }
`;

const TransactionEditContainer = styled.div`
  width: 100%;
  padding: 1rem 0.88rem 1rem 0.88rem;
  border: 1px solid var(--light-gray, #d9d9d9);
  border-radius: 1.078125rem;
  background: var(--white, #ffffff);
`;

const DateSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 2.81rem;
`;

const DateAndTabRow = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DateButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;

  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    opacity: 0.7;
  }
`;

const DateDisplay = styled.div`
  h2 {
    color: var(--black, #000);
    margin: 0;
  }
`;

const TabContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;

  align-self: flex-end;
`;

const TransactionList = styled.div`
  width: 100%;
  min-height: 30rem;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  padding: 2rem;
  border-radius: 0.97744rem;
  border: 1px solid var(--light-gray, #d9d9d9);
  background: var(--white, #ffffff);
`;

const EmptyMessage = styled.p`
  color: var(--gray, #a5a5a5);
  font-size: 1.125rem;
  font-weight: 400;
`;

const Sidebar = styled.aside`
  max-width: 16rem;
  display: flex;
  flex-direction: column;
  gap: 1.9rem;
`;

const SummaryCard = styled.div`
  width: 100%;
  padding: 2.25rem 1.9rem 2.25rem 1.9rem;

  display: flex;
  flex-direction: column;
  gap: 1rem;

  border-radius: 0.97744rem;
  border: 1px solid var(--light-gray, #d9d9d9);
  background: var(--white, #ffffff);
`;

const SummaryTitle = styled.h2`
  color: var(--black, #000);
  font-size: 1.3125rem;
  font-weight: 700;
  text-align: left;
  margin-bottom: 1rem;
  white-space: nowrap;
`;

const SummaryContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const SummaryRow = styled.div`
  display: flex;
  flex-direction: column;
`;

const SummaryLabel = styled.span`
  color: var(--black, #000);
  font-size: 1.125rem;
  font-weight: 560;
  text-align: left;
  margin-left: 0.5rem;
`;

const SummaryValues = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  align-items: flex-end;
  margin-right: 0.5rem;
`;

const SummaryValue = styled.span`
  color: ${({ $type }) =>
    $type === "income" ? "var(--blue, #115bca)" : "var(--black, #000)"};
  font-size: 1.125rem;
  font-weight: 700;
`;

const SummarySubValue = styled.span`
  color: var(--gray, #a5a5a5);
  font-size: 0.925rem;
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
`;

const DailyViewContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0;
`;

const DateGroup = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 1.344rem;
  padding: 0.5rem 0;
`;

const DateHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.172rem;
  min-width: 3rem;
  padding-top: 0.5rem;
`;

const DateDay = styled.span`
  color: var(--black, #000);
  font-size: 0.925rem;
  font-weight: 700;
`;

const DateWeekday = styled.span`
  color: var(--black, #000);
  font-size: 0.925rem;
  font-weight: 500;
`;

const TransactionItemsWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  border-radius: 0.792rem;
  overflow: hidden;
  background: var(--white, #ffffff);
  gap: 0.5rem;
`;

const CategoryViewContainer = styled.div`
  width: 100%;
  min-height: 30rem;
  padding: 2rem;
  border-radius: 0.97744rem;
  border: 1px solid var(--light-gray, #d9d9d9);
  background: var(--white, #ffffff);
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.89rem;
  flex-wrap: wrap;
`;

const CategoryTitle = styled.h2`
  color: var(--black, #000);
  font-size: 1.7rem;
  font-weight: 700;
  margin: 0;
`;

const CategoryAmount = styled.span`
  color: var(--blue, #115bca);
  font-size: 1.7rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
`;

const BudgetMessage = styled.div`
  color: var(--black, #000);
  font-size: 1.125rem;
  font-weight: 700;
  text-align: center;
  margin: -1rem 0 0.5rem 0;
`;

const BudgetMessageAmount = styled.span`
  color: var(--deep-blue, #0b3e99);
`;

const CategoryCardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9.8125rem, 1fr));
  gap: 0.7rem;
  width: 100%;
`;

const BasicCostSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  width: 100%;
`;

const BasicCostHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.89rem;
  flex-wrap: wrap;
  padding: 2rem 2rem 1rem 2rem;
`;

const BasicCostTitle = styled.h2`
  color: var(--black, #000);
  font-size: 1.7rem;
  font-weight: 700;
  margin: 0;
`;

const BasicCostAmount = styled.span`
  color: var(--deep-blue, #0b3e99);
  font-size: 1.7rem;
  font-weight: 700;
`;

const BasicCostGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 0;
  width: 100%;
`;

const EmptySection = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  max-width: 40rem;
  padding: 1rem 1.0625rem 1.5rem 1.0625rem;
  background: var(--white, #ffffff);
  border-radius: 0.97744rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalButtonContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  width: 100%;
  margin-top: 1.5rem;
`;
