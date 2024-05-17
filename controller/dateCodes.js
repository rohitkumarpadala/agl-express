 const currentDate = () => {
    var dateobj = new Date();
    var create_date_time = new Date(
      new Date(dateobj).getTime() + 60 * 60 * (5.5 + 0) * 1000
    );
    create_date_time = create_date_time
      .toISOString()
      .replace(/T/, " ")
      .replace(/\..+/, "");
    return create_date_time;
  };
  module.exports = {currentDate}