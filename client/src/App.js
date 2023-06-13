import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { loadData, uploadFile, updateRecord } from "./service";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

function App() {
  const [users, setUsers] = useState({});
  const [givenValue, setGivenValue] = useState({});
  const [page, setPage] = useState(1);
  const [show, setShow] = useState(false);
  const [editShow, setEditShow] = useState(false);
  const [file, setFile] = useState();
  const countPerPage = 10;

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleEditClose = () => setEditShow(false);
  const handleEditShow = () => setEditShow(true);

  const getUserList = async () => {
    const data = await loadData(page, countPerPage);
    setUsers(data?.data);
  };

  useEffect(() => {
    getUserList();
  }, [page]);

  const handleEdit = (row) => {
    handleEditShow();
    setGivenValue(row);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (file) {
      await uploadFile(file);
      alert("File uploaded successfully");
      setPage(1);
      getUserList();
      handleClose();
    }
  };

  const handleEdtFormSubmit = async (e) => {
    e.preventDefault();
    await updateRecord(givenValue);
    alert("Record updated successfully");
    getUserList();
    handleEditClose();
  };

  const handleFileUpload = (event) => {
    setFile(event.target.files[0]);
  };

  const columns = [
    {
      name: "Store ID",
      selector: "StoreID",
    },
    {
      name: "SKU",
      selector: "SKU",
    },
    {
      name: "Product Name",
      selector: "ProductName",
    },
    {
      name: "Price",
      selector: "Price",
    },
    {
      name: "Action",
      cell: (row) => (
        <Button variant="primary" onClick={() => handleEdit(row)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="container mt-3">
      <form onSubmit={handleFormSubmit}>
        <div className="row">
          <div className="col-10">
            <input
              type="file"
              className="form-control"
              onChange={handleFileUpload}
              name="uploadcsv"
            />
          </div>
          <div className="col-2">
            <Button variant="primary" type="submit">
              Upload
            </Button>
          </div>
        </div>
      </form>

      <Modal show={editShow} onHide={handleEditClose}>
        <Modal.Header closeButton>
          <Modal.Title>Please Edit Price Details</Modal.Title>
        </Modal.Header>
        <form onSubmit={handleEdtFormSubmit}>
          <Modal.Body>
            <div className="row">
              <div className="col-md-5">
                <h5>SKU</h5>
              </div>
              <div className="col-md-7">
                <input
                  type="text"
                  className="form-control"
                  defaultValue={givenValue?.SKU}
                  name="sku"
                  placeholder="SKU"
                  onChange={(e) =>
                    setGivenValue({
                      ...givenValue,
                      SKU: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-5">
                <h5>Product Name</h5>
              </div>
              <div className="col-md-7">
                <input
                  type="text"
                  className="form-control"
                  defaultValue={givenValue?.ProductName}
                  name="ProductName"
                  placeholder="ProductName"
                  onChange={(e) =>
                    setGivenValue({
                      ...givenValue,
                      ProductName: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-5">
                <h5>Price</h5>
              </div>
              <div className="col-md-7">
                <input
                  type="text"
                  className="form-control"
                  defaultValue={givenValue?.Price}
                  name="Price"
                  placeholder="Price"
                  onChange={(e) =>
                    setGivenValue({
                      ...givenValue,
                      Price: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" type="button" onClick={handleEditClose}>
              Close
            </Button>
            <Button variant="primary" type="submit">
              Update
            </Button>
          </Modal.Footer>
        </form>
      </Modal>

      {users.data && (
        <DataTable
          title="Products"
          columns={columns}
          data={users.data}
          highlightOnHover
          pagination
          paginationServer
          paginationTotalRows={users.count}
          paginationRowsPerPageOptions={[5, 15, 25, 50]}
          paginationPerPage={countPerPage}
          paginationComponentOptions={{
            noRowsPerPage: true,
          }}
          onChangePage={setPage}
        />
      )}
    </div>
  );
}

export default App;
