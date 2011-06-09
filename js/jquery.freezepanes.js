/*
 * jQuery freezepanes (jQuery Plugin)
 *
 * Copyright (c) 2010 Tom Shimada
 *
 * Depends Script:
 *	js/jquery.js (1.3.2~)
 */

(function($) {
  $.fn.freezepanes = function(configs) {
    var defaults = {
      width: 0,
      height: 0,
      cols: 0,
      rows: 0,
      bordercolor: null
    };

    var $freezepanes = this;
    if (typeof($freezepanes) !== 'object' || $freezepanes.length < 1) return;

    if (configs) {
      if (typeof(configs) === 'string') {
        if (configs.match(/^_/)) return;
        try{
          eval(configs)();
        } catch(e) {
          if('console' in window) console.log(e);
        }
        return;
      }
      configs = $.extend(defaults, configs);
    } else {
      configs = defaults;
    }
    configs.orig_width = configs.width;
    configs.orig_height = configs.height;
    _setData({configs:configs});

    if (typeof(configs.cols) !== 'number' || typeof(configs.rows) !== 'number') return;
    if (configs.cols === 0 && configs.rows === 0) return;

    if (typeof(configs.width) !== 'number' || typeof(configs.height) !== 'number') return;
    if (configs.width === 0 && configs.height === 0) return;
    if (configs.width > $freezepanes.outerWidth() || configs.width === 0) configs.width = $freezepanes.outerWidth();
    if (configs.height > $freezepanes.outerHeight() || configs.height === 0) configs.height = $freezepanes.outerHeight();

    var unique_id = 'jquery-freezepanes-'+$.data($freezepanes),
        parentbox_id = unique_id+'-parent';
    $freezepanes.wrap('<div id="'+parentbox_id+'" style="width: '+configs.width+'px; height: '+configs.height+'px; position: relative; overflow: hidden;"></div>');
    var $parentbox = $('#'+parentbox_id);
    _setData({unique_id:unique_id});

    var cols = 0,
        rows = 0,
        colsWidth = 0,
        rowsHeight = 0;
    $('tr', $freezepanes).each(function(){
      var $tr = $(this);
      if (rows === 0 && configs.cols !== 0) {
        $('td,th', $tr).each(function(){
          var $td = $(this),
              tdWidth = $td.outerWidth();
          cols += this.colSpan;
          if (cols >= configs.cols) {
            colsWidth += Math.round(tdWidth * ((this.colSpan - (cols - configs.cols)) / this.colSpan));
            return false;
          }
          colsWidth += tdWidth;
        });
      }
      if (rows >= configs.rows) return false;
      rowsHeight += $tr.outerHeight();
      rows ++;
    });

    var body_id = null,
        bodyboxHtml = '';
    body_id = unique_id+'-body';
    bodyboxHtml = '<div id="'+body_id+'" style="width: '+(configs.width - colsWidth)+'px; height: '+(configs.height - rowsHeight)+'px; position: absolute; overflow: scroll; z-index: 4; top: '+rowsHeight+'px; left: '+colsWidth+'px;"></div>';
    $parentbox.append(bodyboxHtml);

    var $bodybox = null,
        $bodytable = null;
    if (body_id) {
      $bodytable = $freezepanes.clone(true).appendTo('#'+body_id).css({
        position: 'absolute',
        top: '-'+rowsHeight+'px',
        left: '-'+colsWidth+'px'
      });
      $bodybox = $('#'+body_id);
    }

    var scrollBarWidth = $bodybox.outerWidth() - $bodybox.get(0).clientWidth,
        scrollBarHeight = $bodybox.outerHeight() - $bodybox.get(0).clientHeight;
    if (configs.orig_width === 0) {
      $parentbox.css('width', configs.width + scrollBarWidth);
      $bodybox.css({
        width: configs.width - colsWidth + scrollBarWidth,
        overflow: 'visible',
        overflowY: 'scroll'
      });
    }
    if (configs.orig_height === 0) {
      $parentbox.css('height', configs.height + scrollBarHeight);
      $bodybox.css({
        height: configs.height - rowsHeight + scrollBarHeight,
        overflow: 'visible',
        overflowX: 'scroll'
      });
    }
    if (configs.orig_width === 0 || configs.orig_height === 0) {
      scrollBarWidth = 0;
      scrollBarHeight = 0;
    }

    var header_id = null,
        headerboxHtml = '';
    if (colsWidth !== 0 && rowsHeight !== 0) {
      header_id = unique_id+'-header';
      headerboxHtml = '<div id="'+header_id+'" style="width: '+colsWidth+'px; height: '+rowsHeight+'px; position: absolute; overflow: hidden; z-index: 1; top: 0px; left: 0px;"></div>';
    }

    var cols_id = null,
        colsboxHtml = '';
    if (rowsHeight !== 0) {
      cols_id = unique_id+'-cols';
      colsboxHtml = '<div id="'+cols_id+'" style="width: '+(configs.width - colsWidth - scrollBarWidth)+'px; height: '+rowsHeight+'px; position: absolute; overflow: hidden; z-index: 2; top: 0px; left: '+colsWidth+'px;"></div>';
      if (configs.bordercolor) colsboxHtml += '<div style="background: '+configs.bordercolor+'; width: '+(configs.width - scrollBarWidth)+'px; height: 1px; position: absolute; overflow: hidden; z-index: 5; top: '+rowsHeight+'px; left: 0px;">&nbsp;</div>';
    }

    var rows_id = null,
        rowsboxHtml = '';
    if (colsWidth !== 0) {
      rows_id = unique_id+'-rows';
      rowsboxHtml = '<div id="'+rows_id+'" style="width: '+colsWidth+'px; height: '+(configs.height - rowsHeight - scrollBarHeight)+'px; position: absolute; overflow: hidden; z-index: 3; top: '+rowsHeight+'px; left: 0px;"></div>';
      if (configs.bordercolor) rowsboxHtml += '<div style="background: '+configs.bordercolor+'; width: 1px; height: '+(configs.height - scrollBarHeight)+'px; position: absolute; overflow: hidden; z-index: 6; top: 0px; left: '+colsWidth+'px;">&nbsp;</div>';
    }

    var boxHtml = headerboxHtml+colsboxHtml+rowsboxHtml;
    $parentbox.append(boxHtml);

    var $headerbox = null,
        $headertable = null;
    if (header_id) {
      $headertable = $freezepanes.clone(true).appendTo('#'+header_id);
      $headerbox = $('#'+header_id);
    }

    var $colsbox = null,
        $colstable = null;
    if (cols_id) {
      $colstable = $freezepanes.clone(true).appendTo('#'+cols_id).css({
        position: 'absolute',
        top: '0px',
        left: '-'+colsWidth+'px'
      });
      $colsbox = $('#'+cols_id);
    }

    var $rowsbox = null,
        $rowstable = null;
    if (rows_id) {
      $rowstable = $freezepanes.clone(true).appendTo('#'+rows_id).css({
        position: 'absolute',
        top: '-'+rowsHeight+'px',
        left: '0px'
      });
      $rowsbox = $('#'+rows_id);
    }

    $freezepanes.css('display', 'none');

    var scrollTop = 0,
        scrollLeft = 0;
    _scrollY();
    _scrollX();
    $bodybox.scroll(function(){
      _scroll();
    });

    function _scroll() {
      _scrollX();
      _scrollY();
    }

    function _scrollX() {
      if ($bodybox.scrollLeft() != scrollLeft) {
        scrollLeft = $bodybox.scrollLeft();
        if (cols_id) $colstable.css('left', '-'+(colsWidth+scrollLeft)+'px');
        return true;
      }
      return false;
    }

    function _scrollY() {
      if ($bodybox.scrollTop() != scrollTop) {
        scrollTop = $bodybox.scrollTop();
        if (rows_id) $rowstable.css('top', '-'+(rowsHeight+scrollTop)+'px');
        return true;
      }
      return false;
    }

    function _setData(obj) {
      var data = _getData();
      data = $.extend(data, obj);
      $.data($freezepanes.get(0), 'freezepanes', data);
    }

    function _getData() {
      return $.data($freezepanes.get(0), 'freezepanes');
    }

    function destroy() {
      var data = _getData(),
          $parentbox = $('#'+data.unique_id+'-parent');
      $parentbox.replaceWith($freezepanes);
      $freezepanes.css('display', '');
    }

    return this;
  }
})(jQuery);
