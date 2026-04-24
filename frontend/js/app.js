var app = angular.module("expenseApp", []);

app.controller("mainController", function($scope, $http, $timeout) {

    let chart;

    $scope.loading = false;
    $scope.toastMsg = "";

    function showToast(msg) {
        $scope.toastMsg = msg;
        $timeout(() => $scope.toastMsg = "", 2000);
    }

    // DARK MODE
    $scope.toggleDark = function() {
        document.body.classList.toggle("dark");
    };

    $scope.menuOpen = false;

    $scope.toggleMenu = function() {
        $scope.menuOpen = !$scope.menuOpen;
    };

    // ================= LOGIN =================
    $scope.loginUser = function() {
        $scope.loading = true;

        $http.post("http://localhost:5000/login", $scope.login)
        .then(res => {
            localStorage.setItem("user_id", res.data.user_id);
            showToast("Login Successful ✅");
            window.location.href = "dashboard.html";
        })
        .catch(() => showToast("Login Failed ❌"))
        .finally(() => $scope.loading = false);
    };

    // ================= SIGNUP =================
    $scope.signupUser = function() {
        $scope.loading = true;

        $http.post("http://localhost:5000/signup", $scope.signup)
        .then(() => {
            showToast("Signup Successful 🎉");
            window.location.href = "index.html";
        })
        .catch(() => showToast("Signup Failed ❌"))
        .finally(() => $scope.loading = false);
    };

    // ================= LOAD DASHBOARD =================
    $scope.loadDashboard = function() {
        $scope.user_id = localStorage.getItem("user_id");
        $scope.getUser();
        $scope.getTransactions();
    };

    // ================= LOGOUT =================
    $scope.logout = function() {
        localStorage.removeItem("user_id");
        window.location.href = "index.html";
    };

    // ================= GET USER =================
    $scope.getUser = function() {
        $http.get("http://localhost:5000/get-user/" + $scope.user_id)
        .then(res => {
            $scope.user = res.data;
        });
    };

    // ================= UPDATE PROFILE =================
    $scope.updateProfile = function() {

        $scope.loading = true;

        $http.put("http://localhost:5000/update-user/" + $scope.user_id, $scope.user)
        .then(() => {
            showToast("Profile Updated ✅");
            $scope.showEdit = false;
        })
        .finally(() => $scope.loading = false);
    };

    // ================= ADD TRANSACTION =================
    $scope.addTransaction = function() {

        if (!$scope.transaction || !$scope.transaction.amount) {
            showToast("Amount required ❌");
            return;
        }

        $scope.loading = true;

        const data = {
            user_id: $scope.user_id,
            amount: Number($scope.transaction.amount),
            type: $scope.transaction.type,
            category: $scope.transaction.category || "Other",
            note: $scope.transaction.note || ""
        };

        $http.post("http://localhost:5000/add-transaction", data)
        .then(() => {
            showToast("Added Successfully 💸");
            $scope.transaction = {};
            $scope.getTransactions();
        })
        .finally(() => $scope.loading = false);
    };

    // ================= GET TRANSACTIONS =================
    $scope.getTransactions = function() {
        $scope.loading = true;

        $http.get("http://localhost:5000/get-transactions/" + $scope.user_id)
        .then(res => {
            $scope.transactions = res.data;
            calculate(res.data);
            createChart();
        })
        .finally(() => $scope.loading = false);
    };

    function calculate(data) {
        let income = 0, expense = 0;

        data.forEach(t => {
            if (t.type === "income") income += t.amount;
            else expense += t.amount;
        });

        $scope.totalIncome = income;
        $scope.totalExpense = expense;
        $scope.balance = income - expense;
    }

    function createChart() {

        if (chart) chart.destroy();

        chart = new Chart(document.getElementById("chart"), {
            type: "doughnut",
            data: {
                labels: ["Income", "Expense", "Balance"],
                datasets: [{
                    data: [
                        $scope.totalIncome,
                        $scope.totalExpense,
                        $scope.balance
                    ],
                    backgroundColor: [
                        "#22c55e",
                        "#ef4444",
                        "#3b82f6"
                    ]
                }]
            },
            options: {
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

});