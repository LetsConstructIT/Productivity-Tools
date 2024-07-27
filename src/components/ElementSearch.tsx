import { ModusButton, ModusTextInput, ModusTooltip, ModusTreeView, ModusTreeViewItem } from "@trimble-oss/modus-react-components";
import { useEffect, useRef, useState } from "react";
import { ObjectProperties, ObjectSelector, WorkspaceAPI } from "trimble-connect-workspace-api";
import * as _ from "lodash";

type ObjectWithValue = {
  properties: ObjectProperties,
  value: string
}

export default function ElementSearch({ api }: { api: WorkspaceAPI }) {
  const [searchValue, setSearchValue] = useState<string>('');
  const [filteredObjects, setFilteredObjects] = useState<ObjectWithValue[]>([]);

  const modelId = useRef<string>('');
  const allModelObjects = useRef<ObjectProperties[]>([]);

  async function getObjectProperties() {
    const objectSelector: ObjectSelector = {
      output: { loadProperties: true }
    };

    if (api === undefined) return;

    const response = await api.viewer.getObjects(objectSelector);
    if (response.length == 0) return;

    modelId.current = response[0].modelId;
    allModelObjects.current = response[0].objects;
  }

  useEffect(() => {
    getObjectProperties();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {

      if (allModelObjects.current.length == 0 || searchValue === null || searchValue.length == 0) {
        setFilteredObjects([]);
        return;
      }

      const loweredSearch = searchValue.toLowerCase();

      const result: ObjectWithValue[] = [];
      for (const modelObject of allModelObjects.current) {
        if (modelObject.properties === undefined) continue;
        let value = '';

        const anyMeets = modelObject.properties.some(pSet => {
          if (pSet.properties === undefined) {

          }
          else {
            const foundProperty = pSet.properties.find(p =>
              p.value.toLocaleString().toLowerCase().includes(loweredSearch));

            if (foundProperty !== undefined) {
              value = foundProperty.value.toLocaleString();
              return true;
            }
          }
        }
        );

        if (anyMeets) {
          result.push({ properties: modelObject, value: value });
        }
      }

      const objectSelector: ObjectSelector = {
        modelObjectIds: [{ modelId: modelId.current, objectRuntimeIds: result.map(r => r.properties.id) }]
      };
      api.viewer.setSelection(objectSelector, "set");

      setFilteredObjects(result);
    }, 1000)

    return () => clearTimeout(delayDebounceFn)
  }, [searchValue]);

  return (
    <>
      <div className="content-panel">
        <div className="row align-items-center">
          <h3 className="col">Search</h3>
          <ModusTooltip text="Refresh model">
            <ModusButton className="col" size="small" buttonStyle="borderless" onClick={getObjectProperties}>
              <i className="modus-icons">refresh</i>
            </ModusButton>
          </ModusTooltip>
        </div>
        <ModusTextInput type="text"
          value={searchValue}
          label="Search phrase"
          placeholder="Value"
          clearable={true}
          onValueChange={e => { setSearchValue(e.target.value) }} />

        <ModusTreeView className="filtered-objects" size="condensed">
          {
            _.map(_.groupBy(filteredObjects, (p => p.value)), (val, key) =>
              <ModusTreeViewItem
                nodeId={key}
                label={key}>
                {
                  val.map(o =>
                    <ModusTreeViewItem
                      nodeId={o.properties.id.toString()}
                      label={o.properties.id.toString()}>
                    </ModusTreeViewItem>
                  )
                }
              </ModusTreeViewItem>
            )
          }
        </ModusTreeView>
      </div>
    </>
  )

}