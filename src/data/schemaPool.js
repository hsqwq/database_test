/**
 * 本地表池 — 真实/经典数据库场景
 *
 * 每个 schemaSet 结构：
 * {
 *   id, name, source, domain, description,
 *   tables: [{ name, columns: [{name, type, description}], primaryKey }],
 *   relationships: [{ from, to, type, description }],
 *   sampleRows: { [tableName]: [{...}] },
 *   suitableFor: string[],       // 适合的考点/题型
 * }
 *
 * 本地表结构用于：
 * 1. 生成 prompt 时从池中选取
 * 2. 批改 prompt 时提供给 AI 的完整上下文
 * 3. SchemaContextPanel 展示给用户
 */

export const SCHEMA_SETS = [
  // ==================== 1. W3Schools TrySQL 商城 ====================
  {
    id: 'w3schools_shop',
    name: 'W3Schools 商城数据库',
    source: 'W3Schools TrySQL',
    domain: '电子商务',
    description: '经典在线商城数据库，包含客户、订单、商品、供应商、员工、物流',
    displayMode: 'described',
    tables: [
      {
        name: 'Customers',
        columns: [
          { name: 'CustomerID', type: 'INT', description: '客户编号，主键' },
          { name: 'CustomerName', type: 'VARCHAR(255)', description: '客户姓名' },
          { name: 'ContactName', type: 'VARCHAR(255)', description: '联系人姓名' },
          { name: 'Address', type: 'VARCHAR(255)', description: '地址' },
          { name: 'City', type: 'VARCHAR(100)', description: '城市' },
          { name: 'PostalCode', type: 'VARCHAR(20)', description: '邮编' },
          { name: 'Country', type: 'VARCHAR(100)', description: '国家' },
        ],
        primaryKey: 'CustomerID',
      },
      {
        name: 'Categories',
        columns: [
          { name: 'CategoryID', type: 'INT', description: '类别编号，主键' },
          { name: 'CategoryName', type: 'VARCHAR(255)', description: '类别名称' },
          { name: 'Description', type: 'VARCHAR(255)', description: '类别描述' },
        ],
        primaryKey: 'CategoryID',
      },
      {
        name: 'Employees',
        columns: [
          { name: 'EmployeeID', type: 'INT', description: '员工编号，主键' },
          { name: 'LastName', type: 'VARCHAR(255)', description: '姓' },
          { name: 'FirstName', type: 'VARCHAR(255)', description: '名' },
          { name: 'BirthDate', type: 'DATE', description: '出生日期' },
          { name: 'Notes', type: 'TEXT', description: '备注' },
        ],
        primaryKey: 'EmployeeID',
      },
      {
        name: 'Orders',
        columns: [
          { name: 'OrderID', type: 'INT', description: '订单编号，主键' },
          { name: 'CustomerID', type: 'INT', description: '客户编号，外键→Customers' },
          { name: 'EmployeeID', type: 'INT', description: '员工编号，外键→Employees' },
          { name: 'OrderDate', type: 'DATE', description: '下单日期' },
          { name: 'ShipperID', type: 'INT', description: '物流商编号，外键→Shippers' },
        ],
        primaryKey: 'OrderID',
      },
      {
        name: 'OrderDetails',
        columns: [
          { name: 'OrderDetailID', type: 'INT', description: '订单明细编号，主键' },
          { name: 'OrderID', type: 'INT', description: '订单编号，外键→Orders' },
          { name: 'ProductID', type: 'INT', description: '商品编号，外键→Products' },
          { name: 'Quantity', type: 'INT', description: '购买数量' },
        ],
        primaryKey: 'OrderDetailID',
      },
      {
        name: 'Products',
        columns: [
          { name: 'ProductID', type: 'INT', description: '商品编号，主键' },
          { name: 'ProductName', type: 'VARCHAR(255)', description: '商品名称' },
          { name: 'SupplierID', type: 'INT', description: '供应商编号，外键→Suppliers' },
          { name: 'CategoryID', type: 'INT', description: '类别编号，外键→Categories' },
          { name: 'Unit', type: 'VARCHAR(100)', description: '单位' },
          { name: 'Price', type: 'DECIMAL(10,2)', description: '单价' },
        ],
        primaryKey: 'ProductID',
      },
      {
        name: 'Shippers',
        columns: [
          { name: 'ShipperID', type: 'INT', description: '物流商编号，主键' },
          { name: 'ShipperName', type: 'VARCHAR(255)', description: '物流公司名称' },
          { name: 'Phone', type: 'VARCHAR(50)', description: '电话' },
        ],
        primaryKey: 'ShipperID',
      },
      {
        name: 'Suppliers',
        columns: [
          { name: 'SupplierID', type: 'INT', description: '供应商编号，主键' },
          { name: 'SupplierName', type: 'VARCHAR(255)', description: '供应商名称' },
          { name: 'ContactName', type: 'VARCHAR(255)', description: '联系人姓名' },
          { name: 'Address', type: 'VARCHAR(255)', description: '地址' },
          { name: 'City', type: 'VARCHAR(100)', description: '城市' },
          { name: 'PostalCode', type: 'VARCHAR(20)', description: '邮编' },
          { name: 'Country', type: 'VARCHAR(100)', description: '国家' },
          { name: 'Phone', type: 'VARCHAR(50)', description: '电话' },
        ],
        primaryKey: 'SupplierID',
      },
    ],
    relationships: [
      { from: 'Orders.CustomerID', to: 'Customers.CustomerID', type: 'N:1', description: '订单属于客户' },
      { from: 'Orders.EmployeeID', to: 'Employees.EmployeeID', type: 'N:1', description: '订单由员工处理' },
      { from: 'Orders.ShipperID', to: 'Shippers.ShipperID', type: 'N:1', description: '订单由物流配送' },
      { from: 'OrderDetails.OrderID', to: 'Orders.OrderID', type: 'N:1', description: '明细属于订单' },
      { from: 'OrderDetails.ProductID', to: 'Products.ProductID', type: 'N:1', description: '明细包含商品' },
      { from: 'Products.SupplierID', to: 'Suppliers.SupplierID', type: 'N:1', description: '商品由供应商提供' },
      { from: 'Products.CategoryID', to: 'Categories.CategoryID', type: 'N:1', description: '商品属于类别' },
    ],
    sampleRows: {
      Customers: [
        { CustomerID: 1, CustomerName: 'Alfreds Futterkiste', ContactName: 'Maria Anders', Address: 'Obere Str. 57', City: 'Berlin', PostalCode: '12209', Country: 'Germany' },
        { CustomerID: 2, CustomerName: 'Ana Trujillo', ContactName: 'Ana Trujillo', Address: 'Avda. de la Constitución 2222', City: 'México D.F.', PostalCode: '05021', Country: 'Mexico' },
      ],
      Categories: [
        { CategoryID: 1, CategoryName: 'Beverages', Description: 'Soft drinks, coffees, teas, beers' },
        { CategoryID: 2, CategoryName: 'Condiments', Description: 'Sweet and savory sauces' },
        { CategoryID: 3, CategoryName: 'Confections', Description: 'Desserts, candies, and sweet breads' },
      ],
      Products: [
        { ProductID: 1, ProductName: 'Chais', SupplierID: 1, CategoryID: 1, Unit: '10 boxes x 20 bags', Price: 18.00 },
        { ProductID: 2, ProductName: 'Chang', SupplierID: 1, CategoryID: 1, Unit: '24 - 12 oz bottles', Price: 19.00 },
        { ProductID: 3, ProductName: 'Aniseed Syrup', SupplierID: 2, CategoryID: 2, Unit: '12 - 550 ml bottles', Price: 10.00 },
      ],
      Orders: [
        { OrderID: 10248, CustomerID: 1, EmployeeID: 5, OrderDate: '1996-07-04', ShipperID: 3 },
        { OrderID: 10249, CustomerID: 2, EmployeeID: 6, OrderDate: '1996-07-05', ShipperID: 1 },
      ],
      OrderDetails: [
        { OrderDetailID: 1, OrderID: 10248, ProductID: 1, Quantity: 12 },
        { OrderDetailID: 2, OrderID: 10248, ProductID: 2, Quantity: 10 },
        { OrderDetailID: 3, OrderID: 10249, ProductID: 1, Quantity: 5 },
      ],
      Employees: [
        { EmployeeID: 5, LastName: 'Buchanan', FirstName: 'Steven', BirthDate: '1955-03-04' },
        { EmployeeID: 6, LastName: 'Suyama', FirstName: 'Michael', BirthDate: '1963-07-02' },
      ],
      Shippers: [
        { ShipperID: 1, ShipperName: 'Speedy Express', Phone: '(503) 555-9831' },
        { ShipperID: 3, ShipperName: 'Federal Shipping', Phone: '(503) 555-9931' },
      ],
      Suppliers: [
        { SupplierID: 1, SupplierName: 'Exotic Liquid', ContactName: 'Charlotte Cooper', Address: '49 Gilbert St.', City: 'London', PostalCode: 'EC1 4SD', Country: 'UK', Phone: '(171) 555-2222' },
        { SupplierID: 2, SupplierName: 'New Orleans Cajun Delights', ContactName: 'Shelley Burke', Address: 'P.O. Box 78934', City: 'New Orleans', PostalCode: '70117', Country: 'USA', Phone: '(100) 555-4822' },
      ],
    },
    suitableFor: [
      'dml-01','dml-02','dml-03','dml-04','dml-05','dml-06','dml-07',
      'dml-08','dml-09','dml-10','dml-11','dml-12','dml-13','dml-14',
      'dml-16','dml-17','dml-18',
      'ra-06','ra-07','ra-08','ra-09','ra-10','ra-12','ra-16','ra-17',
      'ddl-05','ddl-06','ddl-07','ddl-18',
    ],
  },

  // ==================== 2. DreamHome 房产租赁 ====================
  {
    id: 'dreamhome',
    name: 'DreamHome 房产租赁数据库',
    source: '经典教材 DreamHome',
    domain: '房地产租赁',
    description: '房产租赁公司数据库，包含分店、员工、房产、客户、看房记录',
    displayMode: 'described',
    tables: [
      {
        name: 'Branch',
        columns: [
          { name: 'branchNo', type: 'CHAR(5)', description: '分店编号，主键' },
          { name: 'street', type: 'VARCHAR(100)', description: '街道' },
          { name: 'city', type: 'VARCHAR(50)', description: '城市' },
          { name: 'postcode', type: 'VARCHAR(10)', description: '邮编' },
        ],
        primaryKey: 'branchNo',
      },
      {
        name: 'Staff',
        columns: [
          { name: 'staffNo', type: 'CHAR(5)', description: '员工编号，主键' },
          { name: 'fName', type: 'VARCHAR(50)', description: '名' },
          { name: 'lName', type: 'VARCHAR(50)', description: '姓' },
          { name: 'position', type: 'VARCHAR(50)', description: '职位' },
          { name: 'sex', type: 'CHAR(1)', description: '性别 M/F' },
          { name: 'DOB', type: 'DATE', description: '出生日期' },
          { name: 'salary', type: 'DECIMAL(10,2)', description: '薪资' },
          { name: 'branchNo', type: 'CHAR(5)', description: '所属分店编号，外键→Branch' },
        ],
        primaryKey: 'staffNo',
      },
      {
        name: 'PropertyForRent',
        columns: [
          { name: 'propertyNo', type: 'CHAR(5)', description: '房产编号，主键' },
          { name: 'street', type: 'VARCHAR(100)', description: '街道' },
          { name: 'city', type: 'VARCHAR(50)', description: '城市' },
          { name: 'postcode', type: 'VARCHAR(10)', description: '邮编' },
          { name: 'type', type: 'VARCHAR(20)', description: '类型（House/Flat/Apartment）' },
          { name: 'rooms', type: 'INT', description: '房间数' },
          { name: 'rent', type: 'DECIMAL(10,2)', description: '月租' },
          { name: 'ownerNo', type: 'CHAR(5)', description: '业主编号' },
          { name: 'staffNo', type: 'CHAR(5)', description: '负责员工编号，外键→Staff' },
          { name: 'branchNo', type: 'CHAR(5)', description: '所属分店编号，外键→Branch' },
        ],
        primaryKey: 'propertyNo',
      },
      {
        name: 'Client',
        columns: [
          { name: 'clientNo', type: 'CHAR(5)', description: '客户编号，主键' },
          { name: 'fName', type: 'VARCHAR(50)', description: '名' },
          { name: 'lName', type: 'VARCHAR(50)', description: '姓' },
          { name: 'telNo', type: 'VARCHAR(20)', description: '电话' },
          { name: 'prefType', type: 'VARCHAR(20)', description: '偏好类型' },
          { name: 'maxRent', type: 'DECIMAL(10,2)', description: '最高租金预算' },
        ],
        primaryKey: 'clientNo',
      },
      {
        name: 'Viewing',
        columns: [
          { name: 'clientNo', type: 'CHAR(5)', description: '客户编号，联合主键' },
          { name: 'propertyNo', type: 'CHAR(5)', description: '房产编号，联合主键' },
          { name: 'viewDate', type: 'DATE', description: '看房日期' },
          { name: 'comment', type: 'TEXT', description: '看房评价' },
        ],
        primaryKey: 'clientNo, propertyNo',
      },
    ],
    relationships: [
      { from: 'Staff.branchNo', to: 'Branch.branchNo', type: 'N:1', description: '员工属于分店' },
      { from: 'PropertyForRent.staffNo', to: 'Staff.staffNo', type: 'N:1', description: '房产由员工负责' },
      { from: 'PropertyForRent.branchNo', to: 'Branch.branchNo', type: 'N:1', description: '房产属于分店' },
      { from: 'Viewing.clientNo', to: 'Client.clientNo', type: 'N:1', description: '看房关联客户' },
      { from: 'Viewing.propertyNo', to: 'PropertyForRent.propertyNo', type: 'N:1', description: '看房关联房产' },
    ],
    sampleRows: {
      Branch: [
        { branchNo: 'B001', street: '22 Deer Rd', city: 'London', postcode: 'SW1 4EH' },
        { branchNo: 'B002', street: '16 Argyll St', city: 'Aberdeen', postcode: 'AB2 3SU' },
        { branchNo: 'B003', street: '163 Main St', city: 'Glasgow', postcode: 'G11 9QX' },
      ],
      Staff: [
        { staffNo: 'S001', fName: 'John', lName: 'White', position: 'Manager', sex: 'M', DOB: '1965-10-01', salary: 30000, branchNo: 'B001' },
        { staffNo: 'S002', fName: 'Ann', lName: 'Beech', position: 'Assistant', sex: 'F', DOB: '1970-11-10', salary: 12000, branchNo: 'B001' },
        { staffNo: 'S003', fName: 'David', lName: 'Ford', position: 'Supervisor', sex: 'M', DOB: '1968-03-24', salary: 18000, branchNo: 'B002' },
      ],
      PropertyForRent: [
        { propertyNo: 'P001', street: '6 Lawrence St', city: 'Glasgow', postcode: 'G11 9QX', type: 'Flat', rooms: 3, rent: 350, ownerNo: 'O001', staffNo: 'S001', branchNo: 'B001' },
        { propertyNo: 'P002', street: '5 Novar Dr', city: 'Glasgow', postcode: 'G12 9AX', type: 'House', rooms: 5, rent: 600, ownerNo: 'O002', staffNo: 'S002', branchNo: 'B001' },
        { propertyNo: 'P003', street: '12 Argyll St', city: 'Aberdeen', postcode: 'AB2 3SU', type: 'Apartment', rooms: 2, rent: 400, ownerNo: 'O003', staffNo: 'S003', branchNo: 'B002' },
      ],
      Client: [
        { clientNo: 'C001', fName: 'Mike', lName: 'Ritchie', telNo: '01224-671234', prefType: 'Flat', maxRent: 400 },
        { clientNo: 'C002', fName: 'Mary', lName: 'Tregear', telNo: '01224-671235', prefType: 'House', maxRent: 700 },
        { clientNo: 'C003', fName: 'Albert', lName: 'King', telNo: '0131-671236', prefType: 'Apartment', maxRent: 500 },
      ],
      Viewing: [
        { clientNo: 'C001', propertyNo: 'P001', viewDate: '2023-01-05', comment: 'Too small' },
        { clientNo: 'C001', propertyNo: 'P002', viewDate: '2023-01-10', comment: 'Liked' },
        { clientNo: 'C002', propertyNo: 'P001', viewDate: '2023-01-12', comment: 'No dining room' },
        { clientNo: 'C003', propertyNo: 'P003', viewDate: '2023-01-15', comment: 'Too expensive' },
      ],
    },
    suitableFor: [
      'ra-08','ra-09','ra-10','ra-11','ra-16','ra-17',
      'dml-01','dml-03','dml-04','dml-10','dml-11','dml-12','dml-16','dml-18',
      'ddl-04','ddl-05','ddl-07','ddl-18',
    ],
  },

  // ==================== 3. 选课系统 ====================
  {
    id: 'university_enrollment',
    name: '大学选课系统',
    source: '经典教材',
    domain: '教育',
    description: '大学选课数据库，包含学生、课程、教师、教学安排、选课记录',
    displayMode: 'described',
    tables: [
      {
        name: 'Student',
        columns: [
          { name: 'studentId', type: 'CHAR(10)', description: '学号，主键' },
          { name: 'studentName', type: 'VARCHAR(50)', description: '姓名' },
          { name: 'major', type: 'VARCHAR(50)', description: '专业' },
          { name: 'grade', type: 'INT', description: '年级' },
        ],
        primaryKey: 'studentId',
      },
      {
        name: 'Course',
        columns: [
          { name: 'courseId', type: 'CHAR(8)', description: '课程编号，主键' },
          { name: 'courseName', type: 'VARCHAR(100)', description: '课程名称' },
          { name: 'credit', type: 'INT', description: '学分' },
          { name: 'dept', type: 'VARCHAR(50)', description: '开课院系' },
        ],
        primaryKey: 'courseId',
      },
      {
        name: 'Teacher',
        columns: [
          { name: 'teacherId', type: 'CHAR(8)', description: '教师工号，主键' },
          { name: 'teacherName', type: 'VARCHAR(50)', description: '教师姓名' },
          { name: 'dept', type: 'VARCHAR(50)', description: '所属院系' },
        ],
        primaryKey: 'teacherId',
      },
      {
        name: 'Teaching',
        columns: [
          { name: 'teacherId', type: 'CHAR(8)', description: '教师工号，联合主键' },
          { name: 'courseId', type: 'CHAR(8)', description: '课程编号，联合主键' },
          { name: 'semester', type: 'VARCHAR(20)', description: '学期' },
        ],
        primaryKey: 'teacherId, courseId',
      },
      {
        name: 'Enrollment',
        columns: [
          { name: 'studentId', type: 'CHAR(10)', description: '学号，联合主键' },
          { name: 'courseId', type: 'CHAR(8)', description: '课程编号，联合主键' },
          { name: 'semester', type: 'VARCHAR(20)', description: '学期' },
          { name: 'score', type: 'INT', description: '成绩，可为NULL' },
        ],
        primaryKey: 'studentId, courseId',
      },
    ],
    relationships: [
      { from: 'Teaching.teacherId', to: 'Teacher.teacherId', type: 'N:1' },
      { from: 'Teaching.courseId', to: 'Course.courseId', type: 'N:1' },
      { from: 'Enrollment.studentId', to: 'Student.studentId', type: 'N:1' },
      { from: 'Enrollment.courseId', to: 'Course.courseId', type: 'N:1' },
    ],
    sampleRows: {
      Student: [
        { studentId: '202001001', studentName: '张三', major: '计算机科学', grade: 3 },
        { studentId: '202001002', studentName: '李四', major: '数学', grade: 3 },
        { studentId: '202001003', studentName: '王五', major: '物理学', grade: 2 },
      ],
      Course: [
        { courseId: 'CS301', courseName: '数据库系统', credit: 4, dept: '计算机科学' },
        { courseId: 'CS302', courseName: '操作系统', credit: 4, dept: '计算机科学' },
        { courseId: 'CS303', courseName: '数据结构', credit: 3, dept: '计算机科学' },
        { courseId: 'MATH201', courseName: '高等数学', credit: 5, dept: '数学' },
      ],
      Teacher: [
        { teacherId: 'T001', teacherName: '张教授', dept: '计算机科学' },
        { teacherId: 'T002', teacherName: '李教授', dept: '计算机科学' },
        { teacherId: 'T003', teacherName: '王教授', dept: '数学' },
      ],
      Teaching: [
        { teacherId: 'T001', courseId: 'CS301', semester: '2023-秋' },
        { teacherId: 'T001', courseId: 'CS302', semester: '2023-秋' },
        { teacherId: 'T002', courseId: 'CS303', semester: '2023-秋' },
        { teacherId: 'T003', courseId: 'MATH201', semester: '2023-秋' },
      ],
      Enrollment: [
        { studentId: '202001001', courseId: 'CS301', semester: '2023-秋', score: 85 },
        { studentId: '202001001', courseId: 'CS303', semester: '2023-秋', score: 90 },
        { studentId: '202001002', courseId: 'CS301', semester: '2023-秋', score: 78 },
        { studentId: '202001002', courseId: 'MATH201', semester: '2023-秋', score: 88 },
        { studentId: '202001003', courseId: 'CS301', semester: '2023-秋', score: 65 },
        { studentId: '202001003', courseId: 'MATH201', semester: '2023-秋', score: 72 },
      ],
    },
    suitableFor: [
      'ra-01','ra-02','ra-03','ra-04','ra-05','ra-06','ra-07','ra-08','ra-09',
      'ra-10','ra-12','ra-13','ra-14','ra-16','ra-17',
      'dml-01','dml-02','dml-03','dml-04','dml-05','dml-06','dml-07','dml-08',
      'dml-09','dml-10','dml-11','dml-12','dml-14','dml-15','dml-16','dml-17','dml-18',
      'ddl-04','ddl-05','ddl-06','ddl-07','ddl-09','ddl-10','ddl-11','ddl-15','ddl-18',
    ],
  },

  // ==================== 4. 供应商-零件系统 ====================
  {
    id: 'supplier_parts',
    name: '供应商-零件数据库',
    source: '经典教材 SPJ',
    domain: '供应链管理',
    description: '经典供应商-零件-目录数据库，用于集合操作、除法和全称条件练习',
    displayMode: 'described',
    tables: [
      {
        name: 'Supplier',
        columns: [
          { name: 'sid', type: 'INT', description: '供应商编号，主键' },
          { name: 'sname', type: 'VARCHAR(50)', description: '供应商名称' },
          { name: 'city', type: 'VARCHAR(50)', description: '所在城市' },
        ],
        primaryKey: 'sid',
      },
      {
        name: 'Part',
        columns: [
          { name: 'pid', type: 'INT', description: '零件编号，主键' },
          { name: 'pname', type: 'VARCHAR(50)', description: '零件名称' },
          { name: 'color', type: 'VARCHAR(20)', description: '颜色' },
        ],
        primaryKey: 'pid',
      },
      {
        name: 'Catalog',
        columns: [
          { name: 'sid', type: 'INT', description: '供应商编号，联合主键' },
          { name: 'pid', type: 'INT', description: '零件编号，联合主键' },
          { name: 'cost', type: 'DECIMAL(10,2)', description: '供应价格' },
        ],
        primaryKey: 'sid, pid',
      },
    ],
    relationships: [
      { from: 'Catalog.sid', to: 'Supplier.sid', type: 'N:1' },
      { from: 'Catalog.pid', to: 'Part.pid', type: 'N:1' },
    ],
    sampleRows: {
      Supplier: [
        { sid: 1, sname: 'Smith', city: 'London' },
        { sid: 2, sname: 'Jones', city: 'Paris' },
        { sid: 3, sname: 'Blake', city: 'Paris' },
        { sid: 4, sname: 'Clark', city: 'London' },
      ],
      Part: [
        { pid: 1, pname: 'Nut', color: 'Red' },
        { pid: 2, pname: 'Bolt', color: 'Green' },
        { pid: 3, pname: 'Screw', color: 'Blue' },
        { pid: 4, pname: 'Screw', color: 'Red' },
        { pid: 5, pname: 'Cam', color: 'Blue' },
      ],
      Catalog: [
        { sid: 1, pid: 1, cost: 0.50 },
        { sid: 1, pid: 2, cost: 1.00 },
        { sid: 1, pid: 3, cost: 0.75 },
        { sid: 2, pid: 1, cost: 0.45 },
        { sid: 2, pid: 2, cost: 1.10 },
        { sid: 2, pid: 3, cost: 0.80 },
        { sid: 2, pid: 4, cost: 0.60 },
        { sid: 3, pid: 2, cost: 1.05 },
        { sid: 3, pid: 3, cost: 0.70 },
        { sid: 3, pid: 5, cost: 2.00 },
        { sid: 4, pid: 1, cost: 0.48 },
        { sid: 4, pid: 2, cost: 0.99 },
      ],
    },
    suitableFor: [
      'ra-01','ra-02','ra-03','ra-04','ra-05','ra-06','ra-12','ra-13','ra-14','ra-15','ra-17',
      'dml-05','dml-06','dml-08','dml-09','dml-10','dml-14','dml-16','dml-18',
      'ddl-04','ddl-05','ddl-16',
    ],
  },

  // ==================== 5. 图书馆系统 ====================
  {
    id: 'library',
    name: '图书馆管理系统数据库',
    source: '经典教材',
    domain: '图书馆管理',
    description: '图书馆管理数据库，包含图书、读者、借阅记录，适合DDL约束和DML查询练习',
    displayMode: 'described',
    tables: [
      {
        name: 'Book',
        columns: [
          { name: 'bookId', type: 'CHAR(10)', description: '图书编号，主键' },
          { name: 'title', type: 'VARCHAR(200)', description: '书名' },
          { name: 'author', type: 'VARCHAR(100)', description: '作者' },
          { name: 'category', type: 'VARCHAR(50)', description: '类别' },
          { name: 'price', type: 'DECIMAL(10,2)', description: '价格' },
          { name: 'publisher', type: 'VARCHAR(100)', description: '出版社' },
        ],
        primaryKey: 'bookId',
      },
      {
        name: 'Reader',
        columns: [
          { name: 'readerId', type: 'CHAR(10)', description: '读者证号，主键' },
          { name: 'readerName', type: 'VARCHAR(50)', description: '读者姓名' },
          { name: 'dept', type: 'VARCHAR(50)', description: '所属部门/院系' },
          { name: 'readerType', type: 'VARCHAR(20)', description: '读者类型（学生/教师/社会）' },
        ],
        primaryKey: 'readerId',
      },
      {
        name: 'Borrow',
        columns: [
          { name: 'readerId', type: 'CHAR(10)', description: '读者证号，联合主键' },
          { name: 'bookId', type: 'CHAR(10)', description: '图书编号，联合主键' },
          { name: 'borrowDate', type: 'DATE', description: '借阅日期' },
          { name: 'returnDate', type: 'DATE', description: '归还日期，NULL表示未还' },
        ],
        primaryKey: 'readerId, bookId, borrowDate',
      },
    ],
    relationships: [
      { from: 'Borrow.readerId', to: 'Reader.readerId', type: 'N:1' },
      { from: 'Borrow.bookId', to: 'Book.bookId', type: 'N:1' },
    ],
    sampleRows: {
      Book: [
        { bookId: 'B001', title: '数据库系统概论', author: '王珊', category: '计算机', price: 45.00, publisher: '高等教育出版社' },
        { bookId: 'B002', title: '计算机网络', author: '谢希仁', category: '计算机', price: 39.00, publisher: '电子工业出版社' },
        { bookId: 'B003', title: '平凡的世界', author: '路遥', category: '文学', price: 36.00, publisher: '北京十月文艺出版社' },
        { bookId: 'B004', title: '算法导论', author: 'CLRS', category: '计算机', price: 89.00, publisher: '机械工业出版社' },
      ],
      Reader: [
        { readerId: 'R001', readerName: '赵六', dept: '计算机科学', readerType: '学生' },
        { readerId: 'R002', readerName: '钱七', dept: '数学', readerType: '学生' },
        { readerId: 'R003', readerName: '孙老师', dept: '计算机科学', readerType: '教师' },
      ],
      Borrow: [
        { readerId: 'R001', bookId: 'B001', borrowDate: '2023-01-05', returnDate: '2023-02-05' },
        { readerId: 'R001', bookId: 'B004', borrowDate: '2023-03-10', returnDate: null },
        { readerId: 'R002', bookId: 'B001', borrowDate: '2023-02-15', returnDate: '2023-03-15' },
        { readerId: 'R003', bookId: 'B002', borrowDate: '2023-01-20', returnDate: '2023-03-20' },
        { readerId: 'R003', bookId: 'B003', borrowDate: '2023-04-01', returnDate: null },
      ],
    },
    suitableFor: [
      'dml-01','dml-02','dml-03','dml-04','dml-05','dml-06','dml-08','dml-10',
      'dml-11','dml-12','dml-14','dml-15','dml-16','dml-18',
      'ddl-01','ddl-02','ddl-03','ddl-04','ddl-05','ddl-06','ddl-07','ddl-08',
      'ddl-09','ddl-10','ddl-11','ddl-12','ddl-15','ddl-18','ddl-19',
      'ra-01','ra-02','ra-03','ra-04','ra-09','ra-10','ra-12','ra-14','ra-16',
    ],
  },
];

// 按 id 索引
export const SCHEMA_SETS_BY_ID = {};
for (const s of SCHEMA_SETS) {
  SCHEMA_SETS_BY_ID[s.id] = s;
}

/** 生成表结构的可读展示文本 */
export function buildSchemaDisplayText(schemaSet) {
  if (!schemaSet) return '';
  const lines = [`【${schemaSet.name}】—— ${schemaSet.description}`];
  for (const t of schemaSet.tables) {
    const cols = t.columns.map((c) => {
      let colStr = `  ${c.name} ${c.type}`;
      if (c.name === t.primaryKey) colStr += ' (PK)';
      if (c.description) colStr += ` — ${c.description}`;
      return colStr;
    }).join('\n');
    lines.push(`\n${t.name}(${t.columns.map((c) => c.name).join(', ')})`);
    lines.push(cols);
  }
  if (schemaSet.relationships && schemaSet.relationships.length > 0) {
    lines.push('\n外键关系：');
    for (const r of schemaSet.relationships) {
      lines.push(`  ${r.from} → ${r.to}  (${r.description || r.type})`);
    }
  }
  return lines.join('\n');
}
