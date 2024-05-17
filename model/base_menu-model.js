
const mongoose=require('mongoose');

var EJSON = require('mongodb-extended-json');
// how our document look like
const baseMenusSchema = mongoose.Schema({
    menu_id:  String,
    menu_name:  {type: String},
    menu_type: {type: String},
    menu_order: {type: String},
    menu_status: {type: String},
    menu_web_url:{type: String},
    parent_id:{type: String},
    web_class_name:{type: String},
    web_icon:{type: String},
    created_date_time:{ type : String },
    created_by:{type:String},
    updated_by:{type:String},
    deleted_by:{type:String},
    status:{type: String}
});


const baseMenusModel = mongoose.model('base_menus', baseMenusSchema);

var userDefinedSchemaDetails = [{
    "_id": {
      "$oid": "63610bffb70036c6f6d5d93e"
    },
    "menu_name": "Master",
    "menu_type": "p",
    "menu_order": "1",
    "menu_web_url": "",
    "parent_id": "",
    "web_class_name": "menu-toggle has-dropdown",
    "web_icon": "menu-toggle has-dropdown",
    "created_date_time": "2022-11-05 11:19:39",
    "created_by": "6316f8cbaa00b2e407b90c55",
    "status": "0",
    "__v": 0,
    "deleted_by": "6358fe98218889106e9142e9"
  },{
    "_id": {
      "$oid": "63610c24b70036c6f6d5d942"
    },
    "menu_name": "Register student",
    "menu_type": "s",
    "menu_order": "1",
    "menu_web_url": "/register_student",
    "parent_id": "63610bffb70036c6f6d5d93e",
    "web_class_name": "menu-toggle has-dropdown",
    "web_icon": "menu-toggle has-dropdown",
    "created_date_time": "2022-11-07 10:45:27",
    "created_by": "6316f8cbaa00b2e407b90c55",
    "status": "0",
    "__v": 0,
    "updated_by": "6358fe98218889106e9142e9",
    "deleted_by": "63663aa372ce60cf6a7cf82c"
  },{
    "_id": {
      "$oid": "63610c46b70036c6f6d5d946"
    },
    "menu_name": "Set Fee",
    "menu_type": "s",
    "menu_order": "2",
    "menu_web_url": "/set_fee",
    "parent_id": "63610bffb70036c6f6d5d93e",
    "web_class_name": "menu-toggle has-dropdown",
    "web_icon": "menu-toggle has-dropdown",
    "created_date_time": "2022-11-07 10:45:20",
    "created_by": "6316f8cbaa00b2e407b90c55",
    "status": "0",
    "__v": 0,
    "deleted_by": "63663aa372ce60cf6a7cf82c"
  },{
    "_id": {
      "$oid": "6365fa8572ce60cf6a7cf71c"
    },
    "menu_name": "Dashboard",
    "menu_type": "p",
    "menu_order": "1",
    "menu_web_url": "/dashboard",
    "parent_id": "",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-18 11:53:01",
    "created_by": "6358fe98218889106e9142e9",
    "status": "0",
    "__v": 0,
    "deleted_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "636890d572ce60cf6a7cf8dd"
    },
    "menu_name": "Master",
    "menu_type": "p",
    "menu_order": "2",
    "menu_web_url": "",
    "parent_id": "",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-18 11:52:55",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "0",
    "__v": 0,
    "deleted_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "6368911472ce60cf6a7cf8e2"
    },
    "menu_name": "Set Fees",
    "menu_type": "s",
    "menu_order": "1",
    "menu_web_url": "/set_fee",
    "parent_id": "636890d572ce60cf6a7cf8dd",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-18 11:52:49",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "0",
    "__v": 0,
    "deleted_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "6368913672ce60cf6a7cf8e6"
    },
    "menu_name": "Register Students",
    "menu_type": "s",
    "menu_order": "2",
    "menu_web_url": "/register_students",
    "parent_id": "636890d572ce60cf6a7cf8dd",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-18 11:52:43",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "0",
    "__v": 0,
    "deleted_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "63689da072ce60cf6a7cf9a2"
    },
    "menu_name": "users",
    "menu_type": "s",
    "menu_order": "4",
    "menu_web_url": "/users",
    "parent_id": "636890d572ce60cf6a7cf8dd",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-18 11:52:37",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "0",
    "__v": 0,
    "deleted_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "6377251d861d56265d44cf72"
    },
    "menu_name": "Dashboard",
    "menu_type": "p",
    "menu_order": "1",
    "menu_web_url": "/dashboard",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:34:20",
    "created_by": "6360ff2775601c5dae267438",
    "status": "0",
    "__v": 0,
    "deleted_by": "63663aa372ce60cf6a7cf82c"
  },{
    "_id": {
      "$oid": "6377255f861d56265d44cf76"
    },
    "menu_name": "Master",
    "menu_type": "p",
    "menu_order": "2",
    "menu_web_url": "",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:35:18",
    "created_by": "6360ff2775601c5dae267438",
    "status": "0",
    "__v": 0,
    "deleted_by": "63663aa372ce60cf6a7cf82c"
  },{
    "_id": {
      "$oid": "637725e2861d56265d44cf7c"
    },
    "menu_name": "Register Student",
    "menu_type": "s",
    "menu_order": "1",
    "menu_web_url": "/Registration",
    "parent_id": "6377255f861d56265d44cf76",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:35:11",
    "created_by": "6360ff2775601c5dae267438",
    "status": "0",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438",
    "deleted_by": "63663aa372ce60cf6a7cf82c"
  },{
    "_id": {
      "$oid": "63772861861d56265d44cf8b"
    },
    "menu_name": "Branches",
    "menu_type": "s",
    "menu_order": "2",
    "menu_web_url": "/Branches",
    "parent_id": "6377255f861d56265d44cf76",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:35:04",
    "created_by": "6360ff2775601c5dae267438",
    "status": "0",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438",
    "deleted_by": "63663aa372ce60cf6a7cf82c"
  },{
    "_id": {
      "$oid": "63772871861d56265d44cf8f"
    },
    "menu_name": "Setttings",
    "menu_type": "p",
    "menu_order": "4",
    "menu_web_url": "",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:34:58",
    "created_by": "6360ff2775601c5dae267438",
    "status": "0",
    "__v": 0,
    "updated_by": "63663aa372ce60cf6a7cf82c",
    "deleted_by": "63663aa372ce60cf6a7cf82c"
  },{
    "_id": {
      "$oid": "637728c0861d56265d44cf96"
    },
    "menu_name": "Roles",
    "menu_type": "s",
    "menu_order": "1",
    "menu_web_url": "/Roles",
    "parent_id": "63772871861d56265d44cf8f",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:34:52",
    "created_by": "6360ff2775601c5dae267438",
    "status": "0",
    "__v": 0,
    "deleted_by": "63663aa372ce60cf6a7cf82c"
  },{
    "_id": {
      "$oid": "637728e0861d56265d44cf9b"
    },
    "menu_name": "Organization",
    "menu_type": "s",
    "menu_order": "2",
    "menu_web_url": "/Organization",
    "parent_id": "63772871861d56265d44cf8f",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-18 12:19:46",
    "created_by": "6360ff2775601c5dae267438",
    "status": "0",
    "__v": 0,
    "deleted_by": "63663aa372ce60cf6a7cf82c"
  },{
    "_id": {
      "$oid": "63772901861d56265d44cfa1"
    },
    "menu_name": "Base Menus",
    "menu_type": "s",
    "menu_order": "3",
    "menu_web_url": "/BaseMenu",
    "parent_id": "63772871861d56265d44cf8f",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:34:44",
    "created_by": "6360ff2775601c5dae267438",
    "status": "0",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438",
    "deleted_by": "63663aa372ce60cf6a7cf82c"
  },{
    "_id": {
      "$oid": "63772b2a801bd5e37ff517e5"
    },
    "menu_name": "Organization",
    "menu_type": "s",
    "menu_order": "2",
    "menu_web_url": "/Organization",
    "parent_id": "63772871861d56265d44cf8f",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:34:39",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "0",
    "__v": 0,
    "deleted_by": "63663aa372ce60cf6a7cf82c"
  },{
    "_id": {
      "$oid": "637aff627d93a2d9d0eeb3c9"
    },
    "menu_name": "CONSESSION",
    "menu_type": "p",
    "menu_order": "3",
    "menu_web_url": "",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:34:33",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "0",
    "__v": 0,
    "deleted_by": "63663aa372ce60cf6a7cf82c"
  },{
    "_id": {
      "$oid": "637b02377d93a2d9d0eeb403"
    },
    "menu_name": "CONSESSION SLAB",
    "menu_type": "s",
    "menu_order": "1",
    "menu_web_url": "/ConsessionSlab",
    "parent_id": "637aff627d93a2d9d0eeb3c9",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:34:27",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "0",
    "__v": 0,
    "updated_by": "63663aa372ce60cf6a7cf82c",
    "deleted_by": "63663aa372ce60cf6a7cf82c"
  },{
    "_id": {
      "$oid": "637b3f7fd185be435469d476"
    },
    "menu_name": "Dashboard",
    "menu_type": "p",
    "menu_order": "1",
    "menu_web_url": "/dashboard",
    "web_class_name": "",
    "web_icon": "ri-dashboard-line",
    "created_date_time": "2022-11-22 12:57:13",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "63663aa372ce60cf6a7cf82c"
  },{
    "_id": {
      "$oid": "637b3fa4d185be435469d47b"
    },
    "menu_name": "Master",
    "menu_type": "p",
    "menu_order": "2",
    "menu_web_url": "",
    "web_class_name": "",
    "web_icon": "ri-briefcase-3-line",
    "created_date_time": "2022-11-22 12:57:30",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "63663aa372ce60cf6a7cf82c"
  },{
    "_id": {
      "$oid": "637b3fdad185be435469d480"
    },
    "menu_name": "Bills",
    "menu_type": "p",
    "menu_order": "6",
    "menu_web_url": "",
    "web_class_name": "",
    "web_icon": "ri-bill-line",
    "created_date_time": "2023-01-12 12:30:11",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b4089d185be435469d494"
    },
    "menu_name": "Expenses",
    "menu_type": "p",
    "menu_order": "4",
    "menu_web_url": "",
    "web_class_name": "",
    "web_icon": "ri-currency-fill",
    "created_date_time": "2023-01-11 13:16:29",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b40a1d185be435469d499"
    },
    "menu_name": "Reports",
    "menu_type": "p",
    "menu_order": "8",
    "menu_web_url": "",
    "web_class_name": "",
    "web_icon": "ri ri-clipboard-line",
    "created_date_time": "2023-01-12 12:24:37",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b40b3d185be435469d49e"
    },
    "menu_name": "Settings",
    "menu_type": "p",
    "menu_order": "9",
    "menu_web_url": "",
    "web_class_name": "",
    "web_icon": "ri-settings-5-line",
    "created_date_time": "2023-01-12 11:57:56",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b40d4d185be435469d4a9"
    },
    "menu_name": "Backup Database",
    "menu_type": "p",
    "menu_order": "10",
    "menu_web_url": "/",
    "web_class_name": "",
    "web_icon": "mdi mdi-database",
    "created_date_time": "2023-01-12 12:25:15",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b4101d185be435469d4b9"
    },
    "menu_name": "Register Student",
    "menu_type": "s",
    "menu_order": "1",
    "menu_web_url": "/Registration",
    "parent_id": "63bfa8a75d5415b575930ee7",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2023-01-12 12:06:14",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b412cd185be435469d4c3"
    },
    "menu_name": "Branches",
    "menu_type": "s",
    "menu_order": "1",
    "menu_web_url": "/Branches",
    "parent_id": "637b3fa4d185be435469d47b",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2023-01-12 12:20:44",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b415ed185be435469d4d2"
    },
    "menu_name": "Allocate Branch To Student",
    "menu_type": "s",
    "menu_order": "2",
    "menu_web_url": "/AllocateBranchToStudent",
    "parent_id": "63bfa8a75d5415b575930ee7",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2023-01-12 12:06:45",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b4181d185be435469d4f2"
    },
    "menu_name": "Departments",
    "menu_type": "s",
    "menu_order": "1",
    "menu_web_url": "/Departments",
    "parent_id": "637b3fa4d185be435469d47b",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2023-01-12 12:21:07",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b41a1d185be435469d50c"
    },
    "menu_name": "Staff Department",
    "menu_type": "s",
    "menu_order": "2",
    "menu_web_url": "/StaffDepartment",
    "parent_id": "63bfa8ec5d5415b575930ef1",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2023-01-12 12:09:38",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b41cdd185be435469d517"
    },
    "menu_name": "Add/Modify Fee Types",
    "menu_type": "s",
    "menu_order": "2",
    "menu_web_url": "/AddModifyFeeTypes",
    "parent_id": "63bfa96a5d5415b575930f22",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2023-01-12 12:15:12",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b41edd185be435469d521"
    },
    "menu_name": "Branch Fee",
    "menu_type": "s",
    "menu_order": "1",
    "menu_web_url": "/BranchFee",
    "parent_id": "63bfa96a5d5415b575930f22",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2023-01-12 12:14:27",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b4230d185be435469d52b"
    },
    "menu_name": "Download Excels",
    "menu_type": "s",
    "menu_order": "3",
    "menu_web_url": "/DownloadExcels",
    "parent_id": "637b3fa4d185be435469d47b",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2023-01-12 12:21:41",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b424ed185be435469d535"
    },
    "menu_name": "Relieve Students",
    "menu_type": "s",
    "menu_order": "3",
    "menu_web_url": "/RelieveStudents",
    "parent_id": "63bfa8a75d5415b575930ee7",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2023-01-12 12:07:12",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b4270d185be435469d543"
    },
    "menu_name": "Un Relieve Students",
    "menu_type": "s",
    "menu_order": "4",
    "menu_web_url": "/UnRelieveStudents",
    "parent_id": "63bfa8a75d5415b575930ee7",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2023-01-12 12:07:31",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b428ad185be435469d548"
    },
    "menu_name": "Dues Excel Upload",
    "menu_type": "s",
    "menu_order": "4",
    "menu_web_url": "/DuesExcelUpload",
    "parent_id": "63bfa96a5d5415b575930f22",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2023-01-12 12:16:32",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b42a6d185be435469d557"
    },
    "menu_name": "Add Old Dues",
    "menu_type": "s",
    "menu_order": "3",
    "menu_web_url": "/AddOldDues",
    "parent_id": "63bfa96a5d5415b575930f22",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2023-01-12 12:15:49",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b42c3d185be435469d56c"
    },
    "menu_name": "Create Concession",
    "menu_type": "s",
    "menu_order": "1",
    "menu_web_url": "/Concession",
    "parent_id": "63bfaa325d5415b575930f3c",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2023-01-12 12:17:42",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b42dcd185be435469d577"
    },
    "menu_name": "Student Concession",
    "menu_type": "s",
    "menu_order": "2",
    "menu_web_url": "/StudentConcession",
    "parent_id": "63bfaa325d5415b575930f3c",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2023-01-12 12:18:08",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b42fad185be435469d57f"
    },
    "menu_name": "Promote Students",
    "menu_type": "s",
    "menu_order": "5",
    "menu_web_url": "/PromoteStudents",
    "parent_id": "63bfa8a75d5415b575930ee7",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2023-01-12 12:07:59",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b4320d185be435469d588"
    },
    "menu_name": "Payments",
    "menu_type": "s",
    "menu_order": "1",
    "menu_web_url": "/PayFee",
    "parent_id": "637b3fdad185be435469d480",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2023-01-12 12:30:55",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b433ed185be435469d59a"
    },
    "menu_name": "Edit Bills",
    "menu_type": "s",
    "menu_order": "2",
    "menu_web_url": "/EditBills",
    "parent_id": "637b3fdad185be435469d480",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:52:06",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b435ad185be435469d5b5"
    },
    "menu_name": "Generate Manual Bills",
    "menu_type": "s",
    "menu_order": "3",
    "menu_web_url": "/GenerateManualBills",
    "parent_id": "637b3fdad185be435469d480",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:52:34",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b4376d185be435469d5bc"
    },
    "menu_name": "Edit Manual Bills",
    "menu_type": "s",
    "menu_order": "4",
    "menu_web_url": "/EditManualBills",
    "parent_id": "637b3fdad185be435469d480",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:53:02",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b4394d185be435469d5c9"
    },
    "menu_name": "Final Settlement",
    "menu_type": "s",
    "menu_order": "5",
    "menu_web_url": "/FinalSettlement",
    "parent_id": "63bfa96a5d5415b575930f22",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2023-01-12 12:17:03",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b43b3d185be435469d5ce"
    },
    "menu_name": "Expenses / Collections",
    "menu_type": "s",
    "menu_order": "1",
    "menu_web_url": "/Expenses",
    "parent_id": "637b4089d185be435469d494",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:54:03",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b43cdd185be435469d5db"
    },
    "menu_name": "Student Fee Details",
    "menu_type": "s",
    "menu_order": "1",
    "menu_web_url": "/StudentFeeDetails",
    "parent_id": "637b40a1d185be435469d499",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:54:29",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b43eed185be435469d5e0"
    },
    "menu_name": "Student Wise Details",
    "menu_type": "s",
    "menu_order": "2",
    "menu_web_url": "/StudentWiseDetails",
    "parent_id": "637b40a1d185be435469d499",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:55:02",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b440fd185be435469d5e5"
    },
    "menu_name": "Overall Report",
    "menu_type": "s",
    "menu_order": "3",
    "menu_web_url": "/OverallReport",
    "parent_id": "637b40a1d185be435469d499",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:55:35",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b442dd185be435469d5ea"
    },
    "menu_name": "Day Wise Fee Collections",
    "menu_type": "s",
    "menu_order": "4",
    "menu_web_url": "/DaywisefeeCollections",
    "parent_id": "637b40a1d185be435469d499",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-12-01 11:09:48",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "637b422fd185be435469d528"
  },{
    "_id": {
      "$oid": "637b444ad185be435469d5ef"
    },
    "menu_name": "Amount By Fee Type",
    "menu_type": "s",
    "menu_order": "5",
    "menu_web_url": "/AmountByFeeType",
    "parent_id": "637b40a1d185be435469d499",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:56:34",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b4473d185be435469d5f4"
    },
    "menu_name": "Day Wise Fee Type",
    "menu_type": "s",
    "menu_order": "6",
    "menu_web_url": "/DayWiseFeeType",
    "parent_id": "637b40a1d185be435469d499",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:57:15",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b449dd185be435469d5f9"
    },
    "menu_name": "Counter Wise Fee Collections",
    "menu_type": "s",
    "menu_order": "7",
    "menu_web_url": "/CounterWiseFeeCollections",
    "parent_id": "637b40a1d185be435469d499",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:57:57",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b44b5d185be435469d5fe"
    },
    "menu_name": "Generated Bills",
    "menu_type": "s",
    "menu_order": "8",
    "menu_web_url": "/GeneratedBills",
    "parent_id": "637b40a1d185be435469d499",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:58:21",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b44d0d185be435469d603"
    },
    "menu_name": "Day Book",
    "menu_type": "s",
    "menu_order": "9",
    "menu_web_url": "/DayBook",
    "parent_id": "637b40a1d185be435469d499",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:58:48",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b44fbd185be435469d608"
    },
    "menu_name": "Expenses Collections Report",
    "menu_type": "s",
    "menu_order": "10",
    "menu_web_url": "/CollectionsReport",
    "parent_id": "637b40a1d185be435469d499",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:59:30",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b4512d185be435469d60d"
    },
    "menu_name": "Cumulative Report",
    "menu_type": "s",
    "menu_order": "11",
    "menu_web_url": "/CumulativeReport",
    "parent_id": "637b40a1d185be435469d499",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 14:59:54",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b452fd185be435469d612"
    },
    "menu_name": "Modified Logs",
    "menu_type": "s",
    "menu_order": "12",
    "menu_web_url": "/ModifiedLogs",
    "parent_id": "637b40a1d185be435469d499",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 15:00:23",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b4549d185be435469d617"
    },
    "menu_name": "Pending Old Dues",
    "menu_type": "s",
    "menu_order": "13",
    "menu_web_url": "/PendingOldDues",
    "parent_id": "637b40a1d185be435469d499",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 15:00:49",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b4619d185be435469d61c"
    },
    "menu_name": "Settlements Report",
    "menu_type": "s",
    "menu_order": "14",
    "menu_web_url": "/SettlementsReport",
    "parent_id": "637b40a1d185be435469d499",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 15:04:17",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b4647d185be435469d622"
    },
    "menu_name": "Organizations",
    "menu_type": "s",
    "menu_order": "1",
    "menu_web_url": "/Organization",
    "parent_id": "637b40b3d185be435469d49e",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 15:05:03",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b466fd185be435469d62a"
    },
    "menu_name": "Base Menus",
    "menu_type": "s",
    "menu_order": "2",
    "menu_web_url": "/BaseMenu",
    "parent_id": "637b40b3d185be435469d49e",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 15:05:43",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b46a8d185be435469d63a"
    },
    "menu_name": "Org Menus",
    "menu_type": "s",
    "menu_order": "3",
    "menu_web_url": "/MenusforOrg",
    "parent_id": "637b40b3d185be435469d49e",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 15:06:40",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b46bcd185be435469d64e"
    },
    "menu_name": "Roles",
    "menu_type": "s",
    "menu_order": "4",
    "menu_web_url": "/Roles",
    "parent_id": "637b40b3d185be435469d49e",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 15:07:00",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b46e5d185be435469d65c"
    },
    "menu_name": "Role Menus",
    "menu_type": "s",
    "menu_order": "5",
    "menu_web_url": "/OrgRoles",
    "parent_id": "637b40b3d185be435469d49e",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 15:07:41",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b470bd185be435469d664"
    },
    "menu_name": "Staff Registartion",
    "menu_type": "s",
    "menu_order": "1",
    "menu_web_url": "/CounterRegistartion",
    "parent_id": "63bfa8ec5d5415b575930ef1",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2023-01-12 12:08:24",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "637b472dd185be435469d66a"
    },
    "menu_name": "Counter Access Control",
    "menu_type": "s",
    "menu_order": "7",
    "menu_web_url": "/CounterAccessControl",
    "parent_id": "637b40b3d185be435469d49e",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 15:08:53",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b474ed185be435469d674"
    },
    "menu_name": "Calendar Years",
    "menu_type": "s",
    "menu_order": "8",
    "menu_web_url": "/CalendarYear",
    "parent_id": "637b40b3d185be435469d49e",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 15:09:26",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b4766d185be435469d67e"
    },
    "menu_name": "Academic Years",
    "menu_type": "s",
    "menu_order": "9",
    "menu_web_url": "/AcademicYear",
    "parent_id": "637b40b3d185be435469d49e",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 15:09:50",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "637b4781d185be435469d687"
    },
    "menu_name": "Change Password",
    "menu_type": "s",
    "menu_order": "10",
    "menu_web_url": "/ChangePassword",
    "parent_id": "637b40b3d185be435469d49e",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-22 12:51:34",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0,
    "updated_by": "63663aa372ce60cf6a7cf82c"
  },{
    "_id": {
      "$oid": "637b479ed185be435469d68c"
    },
    "menu_name": "Day Close",
    "menu_type": "s",
    "menu_order": "11",
    "menu_web_url": "/DayClose",
    "parent_id": "637b40b3d185be435469d49e",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-11-21 15:10:46",
    "created_by": "63663aa372ce60cf6a7cf82c",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "638eedd1858e7295c503857c"
    },
    "menu_name": "DAY END",
    "menu_type": "p",
    "menu_order": "1",
    "menu_web_url": "",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-12-06 12:53:04",
    "created_by": "637b422fd185be435469d528",
    "status": "0",
    "__v": 0,
    "deleted_by": "637b422fd185be435469d528"
  },{
    "_id": {
      "$oid": "63a54a83198a58d55bdd0b9d"
    },
    "menu_name": "menu1",
    "menu_type": "p",
    "menu_order": "8",
    "menu_web_url": "/menu",
    "web_class_name": "",
    "web_icon": "",
    "created_date_time": "2022-12-23 17:08:17",
    "created_by": "637b422fd185be435469d528",
    "status": "0",
    "__v": 0,
    "deleted_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "63bfa8a75d5415b575930ee7"
    },
    "menu_name": "Student",
    "menu_type": "p",
    "menu_order": "3",
    "menu_web_url": "",
    "web_class_name": "",
    "web_icon": "ri-book-2-line",
    "created_date_time": "2023-01-12 11:58:55",
    "created_by": "6360ff2775601c5dae267438",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "63bfa8ec5d5415b575930ef1"
    },
    "menu_name": "Staff",
    "menu_type": "p",
    "menu_order": "4",
    "menu_web_url": "",
    "web_class_name": "",
    "web_icon": "ri-team-line",
    "created_date_time": "2023-01-12 12:00:04",
    "created_by": "6360ff2775601c5dae267438",
    "status": "1",
    "__v": 0
  },{
    "_id": {
      "$oid": "63bfa96a5d5415b575930f22"
    },
    "menu_name": "Fee",
    "menu_type": "p",
    "menu_order": "5",
    "menu_web_url": "",
    "web_class_name": "",
    "web_icon": "ri-file-list-3-line",
    "created_date_time": "2023-01-12 14:03:08",
    "created_by": "6360ff2775601c5dae267438",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  },{
    "_id": {
      "$oid": "63bfaa325d5415b575930f3c"
    },
    "menu_name": "Concession ",
    "menu_type": "p",
    "menu_order": "7",
    "menu_web_url": "",
    "web_class_name": "",
    "web_icon": "ri-hand-coin-line",
    "created_date_time": "2023-01-12 12:24:19",
    "created_by": "6360ff2775601c5dae267438",
    "status": "1",
    "__v": 0,
    "updated_by": "6360ff2775601c5dae267438"
  }];
[{
  "_id": {
    "$oid": "63610bffb70036c6f6d5d93e"
  },
  "menu_name": "Master",
  "menu_type": "p",
  "menu_order": "1",
  "menu_web_url": "",
  "parent_id": "",
  "web_class_name": "menu-toggle has-dropdown",
  "web_icon": "menu-toggle has-dropdown",
  "created_date_time": "2022-11-05 11:19:39",
  "created_by": "6316f8cbaa00b2e407b90c55",
  "status": "0",
  "__v": 0,
  "deleted_by": "6358fe98218889106e9142e9"
},{
  "_id": {
    "$oid": "63610c24b70036c6f6d5d942"
  },
  "menu_name": "Register student",
  "menu_type": "s",
  "menu_order": "1",
  "menu_web_url": "/register_student",
  "parent_id": "63610bffb70036c6f6d5d93e",
  "web_class_name": "menu-toggle has-dropdown",
  "web_icon": "menu-toggle has-dropdown",
  "created_date_time": "2022-11-07 10:45:27",
  "created_by": "6316f8cbaa00b2e407b90c55",
  "status": "0",
  "__v": 0,
  "updated_by": "6358fe98218889106e9142e9",
  "deleted_by": "63663aa372ce60cf6a7cf82c"
},{
  "_id": {
    "$oid": "63610c46b70036c6f6d5d946"
  },
  "menu_name": "Set Fee",
  "menu_type": "s",
  "menu_order": "2",
  "menu_web_url": "/set_fee",
  "parent_id": "63610bffb70036c6f6d5d93e",
  "web_class_name": "menu-toggle has-dropdown",
  "web_icon": "menu-toggle has-dropdown",
  "created_date_time": "2022-11-07 10:45:20",
  "created_by": "6316f8cbaa00b2e407b90c55",
  "status": "0",
  "__v": 0,
  "deleted_by": "63663aa372ce60cf6a7cf82c"
},{
  "_id": {
    "$oid": "6365fa8572ce60cf6a7cf71c"
  },
  "menu_name": "Dashboard",
  "menu_type": "p",
  "menu_order": "1",
  "menu_web_url": "/dashboard",
  "parent_id": "",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-18 11:53:01",
  "created_by": "6358fe98218889106e9142e9",
  "status": "0",
  "__v": 0,
  "deleted_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "636890d572ce60cf6a7cf8dd"
  },
  "menu_name": "Master",
  "menu_type": "p",
  "menu_order": "2",
  "menu_web_url": "",
  "parent_id": "",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-18 11:52:55",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "0",
  "__v": 0,
  "deleted_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "6368911472ce60cf6a7cf8e2"
  },
  "menu_name": "Set Fees",
  "menu_type": "s",
  "menu_order": "1",
  "menu_web_url": "/set_fee",
  "parent_id": "636890d572ce60cf6a7cf8dd",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-18 11:52:49",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "0",
  "__v": 0,
  "deleted_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "6368913672ce60cf6a7cf8e6"
  },
  "menu_name": "Register Students",
  "menu_type": "s",
  "menu_order": "2",
  "menu_web_url": "/register_students",
  "parent_id": "636890d572ce60cf6a7cf8dd",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-18 11:52:43",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "0",
  "__v": 0,
  "deleted_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "63689da072ce60cf6a7cf9a2"
  },
  "menu_name": "users",
  "menu_type": "s",
  "menu_order": "4",
  "menu_web_url": "/users",
  "parent_id": "636890d572ce60cf6a7cf8dd",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-18 11:52:37",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "0",
  "__v": 0,
  "deleted_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "6377251d861d56265d44cf72"
  },
  "menu_name": "Dashboard",
  "menu_type": "p",
  "menu_order": "1",
  "menu_web_url": "/dashboard",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:34:20",
  "created_by": "6360ff2775601c5dae267438",
  "status": "0",
  "__v": 0,
  "deleted_by": "63663aa372ce60cf6a7cf82c"
},{
  "_id": {
    "$oid": "6377255f861d56265d44cf76"
  },
  "menu_name": "Master",
  "menu_type": "p",
  "menu_order": "2",
  "menu_web_url": "",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:35:18",
  "created_by": "6360ff2775601c5dae267438",
  "status": "0",
  "__v": 0,
  "deleted_by": "63663aa372ce60cf6a7cf82c"
},{
  "_id": {
    "$oid": "637725e2861d56265d44cf7c"
  },
  "menu_name": "Register Student",
  "menu_type": "s",
  "menu_order": "1",
  "menu_web_url": "/Registration",
  "parent_id": "6377255f861d56265d44cf76",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:35:11",
  "created_by": "6360ff2775601c5dae267438",
  "status": "0",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438",
  "deleted_by": "63663aa372ce60cf6a7cf82c"
},{
  "_id": {
    "$oid": "63772861861d56265d44cf8b"
  },
  "menu_name": "Branches",
  "menu_type": "s",
  "menu_order": "2",
  "menu_web_url": "/Branches",
  "parent_id": "6377255f861d56265d44cf76",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:35:04",
  "created_by": "6360ff2775601c5dae267438",
  "status": "0",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438",
  "deleted_by": "63663aa372ce60cf6a7cf82c"
},{
  "_id": {
    "$oid": "63772871861d56265d44cf8f"
  },
  "menu_name": "Setttings",
  "menu_type": "p",
  "menu_order": "4",
  "menu_web_url": "",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:34:58",
  "created_by": "6360ff2775601c5dae267438",
  "status": "0",
  "__v": 0,
  "updated_by": "63663aa372ce60cf6a7cf82c",
  "deleted_by": "63663aa372ce60cf6a7cf82c"
},{
  "_id": {
    "$oid": "637728c0861d56265d44cf96"
  },
  "menu_name": "Roles",
  "menu_type": "s",
  "menu_order": "1",
  "menu_web_url": "/Roles",
  "parent_id": "63772871861d56265d44cf8f",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:34:52",
  "created_by": "6360ff2775601c5dae267438",
  "status": "0",
  "__v": 0,
  "deleted_by": "63663aa372ce60cf6a7cf82c"
},{
  "_id": {
    "$oid": "637728e0861d56265d44cf9b"
  },
  "menu_name": "Organization",
  "menu_type": "s",
  "menu_order": "2",
  "menu_web_url": "/Organization",
  "parent_id": "63772871861d56265d44cf8f",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-18 12:19:46",
  "created_by": "6360ff2775601c5dae267438",
  "status": "0",
  "__v": 0,
  "deleted_by": "63663aa372ce60cf6a7cf82c"
},{
  "_id": {
    "$oid": "63772901861d56265d44cfa1"
  },
  "menu_name": "Base Menus",
  "menu_type": "s",
  "menu_order": "3",
  "menu_web_url": "/BaseMenu",
  "parent_id": "63772871861d56265d44cf8f",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:34:44",
  "created_by": "6360ff2775601c5dae267438",
  "status": "0",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438",
  "deleted_by": "63663aa372ce60cf6a7cf82c"
},{
  "_id": {
    "$oid": "63772b2a801bd5e37ff517e5"
  },
  "menu_name": "Organization",
  "menu_type": "s",
  "menu_order": "2",
  "menu_web_url": "/Organization",
  "parent_id": "63772871861d56265d44cf8f",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:34:39",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "0",
  "__v": 0,
  "deleted_by": "63663aa372ce60cf6a7cf82c"
},{
  "_id": {
    "$oid": "637aff627d93a2d9d0eeb3c9"
  },
  "menu_name": "CONSESSION",
  "menu_type": "p",
  "menu_order": "3",
  "menu_web_url": "",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:34:33",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "0",
  "__v": 0,
  "deleted_by": "63663aa372ce60cf6a7cf82c"
},{
  "_id": {
    "$oid": "637b02377d93a2d9d0eeb403"
  },
  "menu_name": "CONSESSION SLAB",
  "menu_type": "s",
  "menu_order": "1",
  "menu_web_url": "/ConsessionSlab",
  "parent_id": "637aff627d93a2d9d0eeb3c9",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:34:27",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "0",
  "__v": 0,
  "updated_by": "63663aa372ce60cf6a7cf82c",
  "deleted_by": "63663aa372ce60cf6a7cf82c"
},{
  "_id": {
    "$oid": "637b3f7fd185be435469d476"
  },
  "menu_name": "Dashboard",
  "menu_type": "p",
  "menu_order": "1",
  "menu_web_url": "/dashboard",
  "web_class_name": "",
  "web_icon": "ri-dashboard-line",
  "created_date_time": "2022-11-22 12:57:13",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "63663aa372ce60cf6a7cf82c"
},{
  "_id": {
    "$oid": "637b3fa4d185be435469d47b"
  },
  "menu_name": "Master",
  "menu_type": "p",
  "menu_order": "2",
  "menu_web_url": "",
  "web_class_name": "",
  "web_icon": "ri-briefcase-3-line",
  "created_date_time": "2022-11-22 12:57:30",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "63663aa372ce60cf6a7cf82c"
},{
  "_id": {
    "$oid": "637b3fdad185be435469d480"
  },
  "menu_name": "Bills",
  "menu_type": "p",
  "menu_order": "6",
  "menu_web_url": "",
  "web_class_name": "",
  "web_icon": "ri-bill-line",
  "created_date_time": "2023-01-12 12:30:11",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b4089d185be435469d494"
  },
  "menu_name": "Expenses",
  "menu_type": "p",
  "menu_order": "4",
  "menu_web_url": "",
  "web_class_name": "",
  "web_icon": "ri-currency-fill",
  "created_date_time": "2023-01-11 13:16:29",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b40a1d185be435469d499"
  },
  "menu_name": "Reports",
  "menu_type": "p",
  "menu_order": "8",
  "menu_web_url": "",
  "web_class_name": "",
  "web_icon": "ri ri-clipboard-line",
  "created_date_time": "2023-01-12 12:24:37",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b40b3d185be435469d49e"
  },
  "menu_name": "Settings",
  "menu_type": "p",
  "menu_order": "9",
  "menu_web_url": "",
  "web_class_name": "",
  "web_icon": "ri-settings-5-line",
  "created_date_time": "2023-01-12 11:57:56",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b40d4d185be435469d4a9"
  },
  "menu_name": "Backup Database",
  "menu_type": "p",
  "menu_order": "10",
  "menu_web_url": "/",
  "web_class_name": "",
  "web_icon": "mdi mdi-database",
  "created_date_time": "2023-01-12 12:25:15",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b4101d185be435469d4b9"
  },
  "menu_name": "Register Student",
  "menu_type": "s",
  "menu_order": "1",
  "menu_web_url": "/Registration",
  "parent_id": "63bfa8a75d5415b575930ee7",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2023-01-12 12:06:14",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b412cd185be435469d4c3"
  },
  "menu_name": "Branches",
  "menu_type": "s",
  "menu_order": "1",
  "menu_web_url": "/Branches",
  "parent_id": "637b3fa4d185be435469d47b",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2023-01-12 12:20:44",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b415ed185be435469d4d2"
  },
  "menu_name": "Allocate Branch To Student",
  "menu_type": "s",
  "menu_order": "2",
  "menu_web_url": "/AllocateBranchToStudent",
  "parent_id": "63bfa8a75d5415b575930ee7",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2023-01-12 12:06:45",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b4181d185be435469d4f2"
  },
  "menu_name": "Departments",
  "menu_type": "s",
  "menu_order": "1",
  "menu_web_url": "/Departments",
  "parent_id": "637b3fa4d185be435469d47b",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2023-01-12 12:21:07",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b41a1d185be435469d50c"
  },
  "menu_name": "Staff Department",
  "menu_type": "s",
  "menu_order": "2",
  "menu_web_url": "/StaffDepartment",
  "parent_id": "63bfa8ec5d5415b575930ef1",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2023-01-12 12:09:38",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b41cdd185be435469d517"
  },
  "menu_name": "Add/Modify Fee Types",
  "menu_type": "s",
  "menu_order": "2",
  "menu_web_url": "/AddModifyFeeTypes",
  "parent_id": "63bfa96a5d5415b575930f22",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2023-01-12 12:15:12",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b41edd185be435469d521"
  },
  "menu_name": "Branch Fee",
  "menu_type": "s",
  "menu_order": "1",
  "menu_web_url": "/BranchFee",
  "parent_id": "63bfa96a5d5415b575930f22",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2023-01-12 12:14:27",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b4230d185be435469d52b"
  },
  "menu_name": "Download Excels",
  "menu_type": "s",
  "menu_order": "3",
  "menu_web_url": "/DownloadExcels",
  "parent_id": "637b3fa4d185be435469d47b",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2023-01-12 12:21:41",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b424ed185be435469d535"
  },
  "menu_name": "Relieve Students",
  "menu_type": "s",
  "menu_order": "3",
  "menu_web_url": "/RelieveStudents",
  "parent_id": "63bfa8a75d5415b575930ee7",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2023-01-12 12:07:12",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b4270d185be435469d543"
  },
  "menu_name": "Un Relieve Students",
  "menu_type": "s",
  "menu_order": "4",
  "menu_web_url": "/UnRelieveStudents",
  "parent_id": "63bfa8a75d5415b575930ee7",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2023-01-12 12:07:31",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b428ad185be435469d548"
  },
  "menu_name": "Dues Excel Upload",
  "menu_type": "s",
  "menu_order": "4",
  "menu_web_url": "/DuesExcelUpload",
  "parent_id": "63bfa96a5d5415b575930f22",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2023-01-12 12:16:32",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b42a6d185be435469d557"
  },
  "menu_name": "Add Old Dues",
  "menu_type": "s",
  "menu_order": "3",
  "menu_web_url": "/AddOldDues",
  "parent_id": "63bfa96a5d5415b575930f22",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2023-01-12 12:15:49",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b42c3d185be435469d56c"
  },
  "menu_name": "Create Concession",
  "menu_type": "s",
  "menu_order": "1",
  "menu_web_url": "/Concession",
  "parent_id": "63bfaa325d5415b575930f3c",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2023-01-12 12:17:42",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b42dcd185be435469d577"
  },
  "menu_name": "Student Concession",
  "menu_type": "s",
  "menu_order": "2",
  "menu_web_url": "/StudentConcession",
  "parent_id": "63bfaa325d5415b575930f3c",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2023-01-12 12:18:08",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b42fad185be435469d57f"
  },
  "menu_name": "Promote Students",
  "menu_type": "s",
  "menu_order": "5",
  "menu_web_url": "/PromoteStudents",
  "parent_id": "63bfa8a75d5415b575930ee7",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2023-01-12 12:07:59",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b4320d185be435469d588"
  },
  "menu_name": "Payments",
  "menu_type": "s",
  "menu_order": "1",
  "menu_web_url": "/PayFee",
  "parent_id": "637b3fdad185be435469d480",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2023-01-12 12:30:55",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b433ed185be435469d59a"
  },
  "menu_name": "Edit Bills",
  "menu_type": "s",
  "menu_order": "2",
  "menu_web_url": "/EditBills",
  "parent_id": "637b3fdad185be435469d480",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:52:06",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b435ad185be435469d5b5"
  },
  "menu_name": "Generate Manual Bills",
  "menu_type": "s",
  "menu_order": "3",
  "menu_web_url": "/GenerateManualBills",
  "parent_id": "637b3fdad185be435469d480",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:52:34",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b4376d185be435469d5bc"
  },
  "menu_name": "Edit Manual Bills",
  "menu_type": "s",
  "menu_order": "4",
  "menu_web_url": "/EditManualBills",
  "parent_id": "637b3fdad185be435469d480",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:53:02",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b4394d185be435469d5c9"
  },
  "menu_name": "Final Settlement",
  "menu_type": "s",
  "menu_order": "5",
  "menu_web_url": "/FinalSettlement",
  "parent_id": "63bfa96a5d5415b575930f22",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2023-01-12 12:17:03",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b43b3d185be435469d5ce"
  },
  "menu_name": "Expenses / Collections",
  "menu_type": "s",
  "menu_order": "1",
  "menu_web_url": "/Expenses",
  "parent_id": "637b4089d185be435469d494",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:54:03",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b43cdd185be435469d5db"
  },
  "menu_name": "Student Fee Details",
  "menu_type": "s",
  "menu_order": "1",
  "menu_web_url": "/StudentFeeDetails",
  "parent_id": "637b40a1d185be435469d499",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:54:29",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b43eed185be435469d5e0"
  },
  "menu_name": "Student Wise Details",
  "menu_type": "s",
  "menu_order": "2",
  "menu_web_url": "/StudentWiseDetails",
  "parent_id": "637b40a1d185be435469d499",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:55:02",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b440fd185be435469d5e5"
  },
  "menu_name": "Overall Report",
  "menu_type": "s",
  "menu_order": "3",
  "menu_web_url": "/OverallReport",
  "parent_id": "637b40a1d185be435469d499",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:55:35",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b442dd185be435469d5ea"
  },
  "menu_name": "Day Wise Fee Collections",
  "menu_type": "s",
  "menu_order": "4",
  "menu_web_url": "/DaywisefeeCollections",
  "parent_id": "637b40a1d185be435469d499",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-12-01 11:09:48",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "637b422fd185be435469d528"
},{
  "_id": {
    "$oid": "637b444ad185be435469d5ef"
  },
  "menu_name": "Amount By Fee Type",
  "menu_type": "s",
  "menu_order": "5",
  "menu_web_url": "/AmountByFeeType",
  "parent_id": "637b40a1d185be435469d499",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:56:34",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b4473d185be435469d5f4"
  },
  "menu_name": "Day Wise Fee Type",
  "menu_type": "s",
  "menu_order": "6",
  "menu_web_url": "/DayWiseFeeType",
  "parent_id": "637b40a1d185be435469d499",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:57:15",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b449dd185be435469d5f9"
  },
  "menu_name": "Counter Wise Fee Collections",
  "menu_type": "s",
  "menu_order": "7",
  "menu_web_url": "/CounterWiseFeeCollections",
  "parent_id": "637b40a1d185be435469d499",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:57:57",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b44b5d185be435469d5fe"
  },
  "menu_name": "Generated Bills",
  "menu_type": "s",
  "menu_order": "8",
  "menu_web_url": "/GeneratedBills",
  "parent_id": "637b40a1d185be435469d499",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:58:21",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b44d0d185be435469d603"
  },
  "menu_name": "Day Book",
  "menu_type": "s",
  "menu_order": "9",
  "menu_web_url": "/DayBook",
  "parent_id": "637b40a1d185be435469d499",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:58:48",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b44fbd185be435469d608"
  },
  "menu_name": "Expenses Collections Report",
  "menu_type": "s",
  "menu_order": "10",
  "menu_web_url": "/CollectionsReport",
  "parent_id": "637b40a1d185be435469d499",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:59:30",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b4512d185be435469d60d"
  },
  "menu_name": "Cumulative Report",
  "menu_type": "s",
  "menu_order": "11",
  "menu_web_url": "/CumulativeReport",
  "parent_id": "637b40a1d185be435469d499",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 14:59:54",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b452fd185be435469d612"
  },
  "menu_name": "Modified Logs",
  "menu_type": "s",
  "menu_order": "12",
  "menu_web_url": "/ModifiedLogs",
  "parent_id": "637b40a1d185be435469d499",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 15:00:23",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b4549d185be435469d617"
  },
  "menu_name": "Pending Old Dues",
  "menu_type": "s",
  "menu_order": "13",
  "menu_web_url": "/PendingOldDues",
  "parent_id": "637b40a1d185be435469d499",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 15:00:49",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b4619d185be435469d61c"
  },
  "menu_name": "Settlements Report",
  "menu_type": "s",
  "menu_order": "14",
  "menu_web_url": "/SettlementsReport",
  "parent_id": "637b40a1d185be435469d499",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 15:04:17",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b4647d185be435469d622"
  },
  "menu_name": "Organizations",
  "menu_type": "s",
  "menu_order": "1",
  "menu_web_url": "/Organization",
  "parent_id": "637b40b3d185be435469d49e",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 15:05:03",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b466fd185be435469d62a"
  },
  "menu_name": "Base Menus",
  "menu_type": "s",
  "menu_order": "2",
  "menu_web_url": "/BaseMenu",
  "parent_id": "637b40b3d185be435469d49e",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 15:05:43",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b46a8d185be435469d63a"
  },
  "menu_name": "Org Menus",
  "menu_type": "s",
  "menu_order": "3",
  "menu_web_url": "/MenusforOrg",
  "parent_id": "637b40b3d185be435469d49e",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 15:06:40",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b46bcd185be435469d64e"
  },
  "menu_name": "Roles",
  "menu_type": "s",
  "menu_order": "4",
  "menu_web_url": "/Roles",
  "parent_id": "637b40b3d185be435469d49e",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 15:07:00",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b46e5d185be435469d65c"
  },
  "menu_name": "Role Menus",
  "menu_type": "s",
  "menu_order": "5",
  "menu_web_url": "/OrgRoles",
  "parent_id": "637b40b3d185be435469d49e",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 15:07:41",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b470bd185be435469d664"
  },
  "menu_name": "Staff Registartion",
  "menu_type": "s",
  "menu_order": "1",
  "menu_web_url": "/CounterRegistartion",
  "parent_id": "63bfa8ec5d5415b575930ef1",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2023-01-12 12:08:24",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "637b472dd185be435469d66a"
  },
  "menu_name": "Counter Access Control",
  "menu_type": "s",
  "menu_order": "7",
  "menu_web_url": "/CounterAccessControl",
  "parent_id": "637b40b3d185be435469d49e",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 15:08:53",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b474ed185be435469d674"
  },
  "menu_name": "Calendar Years",
  "menu_type": "s",
  "menu_order": "8",
  "menu_web_url": "/CalendarYear",
  "parent_id": "637b40b3d185be435469d49e",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 15:09:26",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b4766d185be435469d67e"
  },
  "menu_name": "Academic Years",
  "menu_type": "s",
  "menu_order": "9",
  "menu_web_url": "/AcademicYear",
  "parent_id": "637b40b3d185be435469d49e",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 15:09:50",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "637b4781d185be435469d687"
  },
  "menu_name": "Change Password",
  "menu_type": "s",
  "menu_order": "10",
  "menu_web_url": "/ChangePassword",
  "parent_id": "637b40b3d185be435469d49e",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-22 12:51:34",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0,
  "updated_by": "63663aa372ce60cf6a7cf82c"
},{
  "_id": {
    "$oid": "637b479ed185be435469d68c"
  },
  "menu_name": "Day Close",
  "menu_type": "s",
  "menu_order": "11",
  "menu_web_url": "/DayClose",
  "parent_id": "637b40b3d185be435469d49e",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-11-21 15:10:46",
  "created_by": "63663aa372ce60cf6a7cf82c",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "638eedd1858e7295c503857c"
  },
  "menu_name": "DAY END",
  "menu_type": "p",
  "menu_order": "1",
  "menu_web_url": "",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-12-06 12:53:04",
  "created_by": "637b422fd185be435469d528",
  "status": "0",
  "__v": 0,
  "deleted_by": "637b422fd185be435469d528"
},{
  "_id": {
    "$oid": "63a54a83198a58d55bdd0b9d"
  },
  "menu_name": "menu1",
  "menu_type": "p",
  "menu_order": "8",
  "menu_web_url": "/menu",
  "web_class_name": "",
  "web_icon": "",
  "created_date_time": "2022-12-23 17:08:17",
  "created_by": "637b422fd185be435469d528",
  "status": "0",
  "__v": 0,
  "deleted_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "63bfa8a75d5415b575930ee7"
  },
  "menu_name": "Student",
  "menu_type": "p",
  "menu_order": "3",
  "menu_web_url": "",
  "web_class_name": "",
  "web_icon": "ri-book-2-line",
  "created_date_time": "2023-01-12 11:58:55",
  "created_by": "6360ff2775601c5dae267438",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "63bfa8ec5d5415b575930ef1"
  },
  "menu_name": "Staff",
  "menu_type": "p",
  "menu_order": "4",
  "menu_web_url": "",
  "web_class_name": "",
  "web_icon": "ri-team-line",
  "created_date_time": "2023-01-12 12:00:04",
  "created_by": "6360ff2775601c5dae267438",
  "status": "1",
  "__v": 0
},{
  "_id": {
    "$oid": "63bfa96a5d5415b575930f22"
  },
  "menu_name": "Fee",
  "menu_type": "p",
  "menu_order": "5",
  "menu_web_url": "",
  "web_class_name": "",
  "web_icon": "ri-file-list-3-line",
  "created_date_time": "2023-01-12 14:03:08",
  "created_by": "6360ff2775601c5dae267438",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
},{
  "_id": {
    "$oid": "63bfaa325d5415b575930f3c"
  },
  "menu_name": "Concession ",
  "menu_type": "p",
  "menu_order": "7",
  "menu_web_url": "",
  "web_class_name": "",
  "web_icon": "ri-hand-coin-line",
  "created_date_time": "2023-01-12 12:24:19",
  "created_by": "6360ff2775601c5dae267438",
  "status": "1",
  "__v": 0,
  "updated_by": "6360ff2775601c5dae267438"
}]

    const addbasemenu = async (menus) => {
        baseMenusModel.count(function(err,countData){
            // console.log(countData)
            if(countData == 0){
                baseMenusModel.insertMany(menus, function(err, result) {
                    // if (err) throw err;
                    // console.log('Inserted docs:', result.insertedCount);
                });
            }
            
        })

    }

    let menudata =EJSON.parse(EJSON.stringify(userDefinedSchemaDetails))
    addbasemenu(menudata)

module.exports=baseMenusModel;