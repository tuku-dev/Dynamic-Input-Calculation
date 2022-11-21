import $ from "jQuery";

document.getElementById("app").innerHTML = `
<!-- Operation A/B Split -->
<aside id="scenarios-ab-split-popup" class="modal scenario-node-modal">
  <form
    method="post"
    style="min-height: 150px; padding-bottom: 100px; padding-top: 0"
    class="scenario-ab-split"
  >
    <h2>Make Splits</h2>
    <!-- <div id="splitChart" class="ab-split-chart"></div> -->
    <div id="graph" class="custom-graph"></div>
    <input
      type="number"
      name="operation_splitter"
      id="operation_splitter"
      data-id="operation_splitter"
      class="ab-split-range"
      min="2"
      max="10"
      value="2"
      step="1"
    />
    <div id="split_part_inputs" class="ab-split-inputs"></div>

    <div class="ab-control-group-section">
      <div class="control-group-chkbox">
        <input
          type="checkbox"
          name="control_group_handler"
          data-id="control_group_handler"
          id="control_group_handler"
          value="true"
        />
        <label for="control_group_handler">Control Group</label>
      </div>

      <div class="ab-cg-inputs disable" id="controlGroupInputs"></div>
    </div>
    <div style="margin-top: 15px">
      Split Total: <strong id="totalSplit"></strong>
    </div>
  </form>
  <span class="cancel" onclick="modal_cancel('#ab-split-form')">Cancel</span>
  <button data-id="submit-scenario-edit" type="button">Update</button>
</aside>
`;

$(document).ready(function () {
  const __sp = "__";
  const prepareJsonStructure = (name, data, note = "") => {
    return {
      name: name,
      data: [data],
      note: note
    };
  };
  const makePartition = (rangeValue) => {
    let partition = [];
    // console.log(rangeValue);
    switch (rangeValue) {
      case 2:
      case 4:
      case 5:
        {
          let alpha = 65;
          for (let i = 0; i < rangeValue; i++) {
            partition[i] = prepareJsonStructure(
              String.fromCharCode(alpha),
              100 / rangeValue
            );
            alpha++;
          }
        }
        break;
      case 3:
        partition[0] = prepareJsonStructure("A", 30);
        partition[1] = prepareJsonStructure("B", 30);
        partition[2] = prepareJsonStructure("c", 40);
        break;
      case 6: {
        let alpha = 65;
        for (let i = 0; i < rangeValue; i++) {
          if (i < 2)
            partition[i] = prepareJsonStructure(String.fromCharCode(alpha), 10);
          else
            partition[i] = prepareJsonStructure(String.fromCharCode(alpha), 20);
          alpha++;
        }
        break;
      }
      case 11:
        {
          let total = 0;
          let alpha = 65;
          for (let i = 0; i < rangeValue - 1; i++) {
            let range = 9;
            partition[i] = prepareJsonStructure(
              String.fromCharCode(alpha),
              range
            );
            total = total + range;
            // else partition[i] = 100
            alpha++;
          }
          partition[rangeValue - 1] = prepareJsonStructure(
            String.fromCharCode(alpha),
            100 - total
          );
        }
        break;

      default:
        {
          let total = 0;
          let alpha = 65;
          for (let i = 0; i < rangeValue - 1; i++) {
            let range = 10;
            partition[i] = prepareJsonStructure(
              String.fromCharCode(alpha),
              range
            );
            total = total + range;
            // else partition[i] = 100
            alpha++;
          }
          partition[rangeValue - 1] = prepareJsonStructure(
            String.fromCharCode(alpha),
            100 - total
          );
        }
        break;
    }
    return partition;
  };
  const prepareHtml = (i, record) => {
    let htm = "";
    htm += '<div class="ab-split-item">';
    htm += '<span class="numbering">' + record.name + "</span>";
    htm += `<input
            type="number"
            maxlength="2"
            min="0"
            name="split_${i}"
            id="split_${i}"
            class="split-inputs"
            value="${record.data[0]}"
            />`;
    htm += '<span class="percentage-symbol">%</span>';
    htm += `<input
            type="text"
            name="split_text_${i}"
            id="split_text_${i}"
            class="split-notes"
            placeholder="User Note"
            value="${record.note}"
            />`;
    htm += "</div>";
    return htm;
  };
  const abSplitDynamicInputs = (arr) => {
    // console.log(arr);
    $("#split_part_inputs").empty();
    $("#controlGroupInputs").empty();
    let htm = "";
    let loopLength = arr.length;

    if (isControlGroupEnabled()) {
      loopLength = loopLength - 1;
      let cHtm = prepareHtml(loopLength, arr[loopLength]);
      $("#controlGroupInputs").append(cHtm);
    }

    for (let i = 0; i < loopLength; i++) {
      htm += prepareHtml(i, arr[i]);
    }
    $("#split_part_inputs").append(htm);
  };
  const isControlGroupEnabled = () => {
    return $('input[data-id="control_group_handler"]')[0].checked;
  };
  const prepareGraph = (data) => {
    $("#graph").empty();
    let colors = [
      "#ff642e",
      "#A7A935",
      "#FF8830",
      "#6B8B26",
      "#FFB253",
      "#597321",
      "#FFC987",
      "#799145",
      "#EC9A4C",
      "#B4D371",
      "#ff642e"
    ];
    let htm = "";
    let i = 0;
    let gTC = ""; //Grid Template Columns
    for (const item of data) {
      let v = item.data[0] / 10;
      if (i === 0) {
        gTC += v + "fr";
      } else {
        gTC += " " + v + "fr";
      }
      htm += `<span style="background: ${colors[i]};" class="graph-item">
              <span class="graph-item-tooltip" style="background: ${colors[i]};">
                <span class="tt-first-line">
                  ${item.name}: ${item.data[0]}
                </span>
                <span class="tt-second-line">${item.note}</span>
              </span>
            </span>`;
      i++;
    }
    $("#graph").css({ "grid-template-columns": gTC }).append(htm);
  };
  const totalSplit = (data) => {
    let total = 0;
    for (const item of data) {
      total += Number(item.data[0]);
    }
    $("#totalSplit").text(total);
  };
  const inputsAndChart = (range) => {
    let partition = makePartition(range);
    abSplitDynamicInputs(partition);
    prepareGraph(partition);
    totalSplit(partition);
  };
  const prepareABSplit = (data) => {
    /**
     * The Main Function
     * For primary splits
     */
    let id = data.id;
    inputsAndChart(2);

    /**
     * Splits on counter change
     */
    $('input[data-id="operation_splitter"]').on("change", function (e) {
      let rangeValue = Number(e.target.value);
      if (isControlGroupEnabled()) {
        rangeValue = rangeValue + 1;
      }
      inputsAndChart(rangeValue);
    });

    /**
     * Splits on checking Control Group
     */
    $('input[data-id="control_group_handler"]').on("click", function (e) {
      $(".ab-cg-inputs").toggleClass("disable enable");
      let splitValue = Number($('input[data-id="operation_splitter"]').val());
      $("#controlGroupInputs").empty();
      if (e.target.checked) {
        splitValue += 1;
      }
      inputsAndChart(splitValue);
    });

    /**
     * Codes for check if user enters a value greater than 99. Because minimum partition is 2
     * If entered, it ignores the value and keeps the previous value under 99
     */
    let valueBeforeKeyUp;
    $(document).on("keydown", "#split_part_inputs .split-inputs", function (e) {
      valueBeforeKeyUp = e.target.value;
    });
    $(document).on("keyup change", ".ab-split-item .split-inputs", function (
      e
    ) {
      if (Number(e.target.value) > 99) {
        $(e.target).val(valueBeforeKeyUp);
      } else {
        let partition = [];
        $(".ab-split-item .split-inputs").each(function (i, el) {
          let parent = $(el).parent(".ab-split-item");
          let list = parent.find(".numbering").text();
          let value = $(el).val();
          let note = parent.find(".split-notes").val();
          partition[i] = prepareJsonStructure(list, value, note);
        });
        prepareGraph(partition);
        totalSplit(partition);
      }
    });

    $('label[for="control_group_handler"]').attr(
      "for",
      $('label[for="control_group_handler"]').attr("for") + __sp + data.id
    );
    if (data.activity_config) {
      showABSplitData(data);
    }
  };
  const showABSplitData = (data) => {
    console.log(data);

    const uId = data.id;
    const rangeValue = data.activity_config.operation_splitter;
    const partition = [];
    let alpha = 65;
    let activity_config = data.activity_config;
    // let chkbox = $("#control_group_handler" + __sp + uId);
    let chkbox = $("#control_group_handler");
    if (Boolean(activity_config.control_group_handler)) {
      chkbox.prop("checked", true);
      console.log(activity_config.control_group_handler);
      $(".ab-cg-inputs").toggleClass("disable enable");
    } else {
      chkbox.prop("checked", false);
      $(".ab-cg-inputs").toggleClass("disable enable");
    }
    for (let i = 0; i < rangeValue; i++, alpha++) {
      partition[i] = prepareJsonStructure(
        String.fromCharCode(alpha),
        activity_config["split_" + i],
        activity_config["split_text_" + i]
      );
    }
    // console.log(partition);
    abSplitDynamicInputs(partition);
    prepareGraph(partition);
  };

  prepareABSplit({});
});
