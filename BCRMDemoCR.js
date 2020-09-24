/*blacksheep IT consulting Copyright
* Copyright (C) 2020

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

/* Example Context Renderer for Siebel Smartphone UX 20.9 or higher */
/* Tested on Sales Mobile 20.9 */
/* Manifest Administration: Associate with DEFAULT VIEW, use Smartphone expression, include siebel/viewpr.js (Sequence 1) */

if (typeof SiebelAppFacade.BCRMDemoCR === "undefined") {
    SiebelJS.Namespace("SiebelAppFacade.BCRMDemoCR");
    define("siebel/custom/BCRMDemoCR", ["siebel/basecr"], function () {
        SiebelAppFacade.BCRMDemoCR = (function () {
            function BCRMDemoCR() {
            }
            SiebelJS.Extend(BCRMDemoCR, SiebelAppFacade.BaseCR);

            BCRMDemoCR.prototype.Init = function (prContext) {
                console.log("BCRMDemoCR.Init");
                try {
                    //view PR passed as context
                    var am = prContext.GetPM().Get("GetAppletMap");
                    for (a in am) {
                        var pm = am[a].GetPModel();

                        //see individual functions for description
                        //list applets only
                        if (pm.Get("GetListOfColumns")) {
                            pm.AttachPMBinding("ShowSelection", this.HideEmptyFields, { sequence: true, scope: pm });
                            pm.AttachPMBinding("FieldChange", this.HideEmptyFields, { sequence: true, scope: pm });

                            pm.AttachPMBinding("ShowSelection", this.EnhanceAddress, { sequence: true, scope: pm });
                            pm.AttachPMBinding("FieldChange", this.EnhanceAddress, { sequence: true, scope: pm });

                            pm.AttachPMBinding("ShowSelection", this.ClassifyFields, { sequence: true, scope: pm });
                            pm.AttachPMBinding("FieldChange", this.ClassifyFields, { sequence: true, scope: pm });

                            pm.AttachPMBinding("ShowSelection", this.GridWrapper, { sequence: true, scope: pm });
                            pm.AttachPMBinding("FieldChange", this.GridWrapper, { sequence: true, scope: pm });
                        }
                    }
                }
                catch (error) {
                    //ignore
                }
            }

            BCRMDemoCR.prototype.Execute = function (prContext) {
                console.log("BCRMDemoCR.Execute");
                try {
                    //view PR passed as context
                    var am = prContext.GetPM().Get("GetAppletMap");
                    for (a in am) {
                        var pm = am[a].GetPModel();
                        //list applets only
                        if (pm.Get("GetListOfColumns")) {
                            this.HideEmptyFields(pm);
                            this.EnhanceAddress(pm);
                            this.ClassifyFields(pm);
                            this.GridWrapper(pm);
                        }
                        //all applets
                        this.CreateControlsMenu(pm);
                    }
                }
                catch (error) {
                    //ignore
                }

            }

            //custom functions
            //hide empty fields from non-editable tiles to reduce white space and clutter
            BCRMDemoCR.prototype.HideEmptyFields = function (pm) {
                if (typeof (pm) === "undefined") {
                    pm = this;
                }
                if (typeof (pm.Get) === "function") {
                    if (!pm.Get("IsInQueryMode")) {
                        var fid = pm.Get("GetFullId");
                        $("#s_" + fid + "_div").find(".siebui-tile").not(".siebui-editable").find(".siebui-value").each(function (x) {
                            if ($(this).find("input").val() == "") {
                                if (!$(this).hasClass("mceField")) {
                                    $(this).parent().hide();
                                }
                            }
                            //repeat for textarea if necessary
                        });
                    }
                }
            };

            //simplified Google Maps URL generator, requires a "Full Address" field in (raw) record set
            BCRMDemoCR.prototype.EnhanceAddress = function (pm) {
                if (typeof (pm) === "undefined") {
                    pm = this;
                }
                if (typeof (pm.Get) === "function") {
                    var fid = pm.Get("GetFullId");
                    var rs = pm.Get("GetRawRecordSet");
                    var cs = pm.Get("GetControls");
                    var cname;
                    var gmap;
                    var tile;
                    var fa, af, c, r, address_found;

                    //check for address fields (example for Account, Contact BC)
                    //applet must expose these fields, this is a static example

                    address_found = false;
                    if (typeof (rs[0]["Street Address"]) !== "undefined" && typeof (rs[0]["Full Address"]) !== "undefined") {
                        address_found = true;
                    }
                    if (address_found) {

                        //find input name string
                        for (c in cs) {
                            if (cs[c].GetFieldName() == "Street Address") {
                                cname = cs[c].GetInputName();
                            }
                        }

                        //wrap address field in Google Maps URL
                        for (r in rs) {
                            fa = rs[r]["Full Address"];
                            gmap = $('<a class="bcrm-gmap" href="https://www.google.com/maps/place/' + fa + '" target="_blank"></a>');
                            tile = $("#" + fid + "_tile_container").find("#" + fid + "_tile_" + r);
                            af = tile.find("[name='" + cname + "']");
                            af.wrap(gmap);
                        }
                    }
                }
            };

            //add attributes to every field container for easy CSS
            //Example: Show icons related to Status values etc.
            BCRMDemoCR.prototype.ClassifyFields = function (pm) {
                if (typeof (pm) === "undefined") {
                    pm = this;
                }
                if (typeof (pm.Get) === "function") {
                    var bc = pm.Get("GetBusComp").GetName();
                    var fid = pm.Get("GetFullId");
                    var rs = pm.Get("GetRecordSet");
                    var cs = pm.Get("GetControls");
                    for (r in rs) {
                        //get tile for current record
                        tile = $("#" + fid + "_tile_container").find("#" + fid + "_tile_" + r);

                        //add extension attributes for BC.Field and value to each field in current tile
                        tile.find(".siebui-value").each(function (x) {
                            var cn = $(this).find("input").attr("name");
                            var val = $(this).find("input").val();
                            var fn = "";
                            for (c in cs) {
                                if (cs[c].GetInputName() == cn) {
                                    fn = cs[c].GetFieldName();
                                }
                            }
                            if (fn != "") {
                                fn = bc + "." + fn;
                                $(this).parent().attr("bcrm-field", fn);
                                //sanitize field value
                                val = val.replace(/\W/g, "").substring(0, 30);
                                $(this).parent().attr("bcrm-data", val);
                            }
                        });
                    }
                }
            };

            //Wrap all but the first field in a tile in a custom div
            //Example: use CSS to achieve 2-column layout inside tile
            BCRMDemoCR.prototype.GridWrapper = function (pm) {
                if (typeof (pm) === "undefined") {
                    pm = this;
                }
                if (typeof (pm.Get) === "function") {
                    if (!pm.Get("IsInQueryMode")) {
                        var fid = pm.Get("GetFullId");
                        var t = $("<div id='bcrm-wrapper'>");
                        $("#s_" + fid + "_div").find(".siebui-tile").each(function (x) {
                            if ($(this).find("#bcrm-wrapper").length == 0) {
                                var fs = $(this).find(".siebui-fieldset").not(":first");
                                fs.wrapAll(t);
                            }
                        });
                    }
                }
            };

            //Siebel Bookshelf example: Replace applet button bar with a single button
            //https://docs.oracle.com/cd/F26413_09/books/ConfigOpenUI/architecture-of-siebel-open-ui.html#c_ExampleOfContextRenderer

            BCRMDemoCR.prototype.CreateControlsMenu = function (pm) {
                var htmlString = "<button class='siebui-icon-display-tile appletButton'>";
                if (pm) {
                    var ae = $("#" + pm.Get("GetFullId"));
                    var btnContainer = ae.find(".siebui-btn-grp-applet");
                    if (btnContainer.length == 0) {
                        btnContainer = ae.find(".siebui-btn-grp-standard");
                    }
                    if (btnContainer.length) {
                        btnContainer.addClass("bcrm-menu");
                        btnContainer.before(htmlString);
                        btnContainer.menu().hide().bind("menuselect", { ctx: this }, function (event, ui) {
                            $(this).hide();
                        });

                        ae.find("button.siebui-icon-display-tile").click({ ctx: btnContainer }, function (evt) {
                            var btnContainerEl = evt.data.ctx;
                            if (btnContainerEl.menu().is(":visible")) {
                                btnContainerEl.menu().hide();
                            }
                            else {
                                btnContainerEl.menu().show().position({
                                    my: "center top",
                                    at: "center bottom",
                                    of: $(this),
                                    collision: "flipfit flipfit"
                                });
                            }
                        });
                    }
                }
            };
            return BCRMDemoCR;
        }());
        return SiebelAppFacade.BCRMDemoCR;
    });
}

