domain = `http://belum-ada-domain/`

## Table of Contents
- [Login](#login)
- [Logout](#logout)
- [Register](#register)
- [Forgot Password](#forgot-password)
- [Ambil Timeline Pelaporan](#ambil-timeline-pelaporan)
- [Ambil Informasi Profile Pengguna](#ambil-informasi-profile-pengguna)
- [Ambil data Laporan](#ambil-data-laporan)
- [Ambil Data Komentar Laporan](#ambil-data-komentar-laporan)
- [Membuat Laporan Baru](#membuat-laporan-baru)
- [Membuat Komentar Baru](#membuat-komentar-baru)
- [Menghapus Laporan](#menghapus-laporan)
- [Menghapus Komentar](#menghapus-komentar)
- [melihat Organisasi](#melihat-organisasi)

## Login

  Return informasi login sukses/gagal.

* **URL**
    
    `/login`

* **Method:**

    `POST`
  
*  **URL Params**

    **Required:**
 
    none
    
    **optional:**
    
    none

* **Body Params**

    **Required:**
    
        username : String
        password : String
    
    **optional:**
    
    none

* **Success Response:**

    ```javascript
    {
	    error : false,
	    data : {
	      id: Number,
		  username: String,
		  name: String,
		  phone: String,
		  email: String,
		  avatar: String,
		  gender: String,
		  password: String,
		  created_date: Date,
		  last_login: Date,
		  verified: Boolean,
		  active: Boolean 
        }
    }
    ```
  
  *jangan lupa ambil & simpan cookie dari header.*
 
* **Error Response:**
    ```javascript
    {
        error : true,
        message : String
    }
    ```

* **Sample Call:**

  ```javascript
    $.ajax({
      url: domain + "login",
      type : "POST",
      data : {
        username : 'joko',
        password : 'lalala'
      },
      success : function(data, status, xhr) {
        var rec = JSON.parse(xhr.responseText);
        if(!rec.error){
          console.log('success');
        } else {
          console.log('failed');
        }
      }
    });
  ```

## Logout

  Return informasi logout sukses/gagal.

* **URL**
    
    `/logout`

* **Method:**

    `ALL`
  
*  **URL Params**

    **Required:**
 
    none
    
    **optional:**
    
    none

* **Body Params**

    **Required:**
    
    none
    
    **optional:**
    
    none

* **Success Response:**

    ```javascript
    {
        error : false
    }
    ```
 
* **Error Response:**

    ```javascript
    {
        error : true,
        message : String
    }
    ```

* **Sample Call:**

  ```javascript
    $.ajax({
      url: domain + "logout",
      type : "GET",
      success : function(data, status, xhr) {
        var rec = JSON.parse(xhr.responseText);
        if(!rec.error){
          console.log('success');
        } else {
          console.log('failed');
        }
      }
    });
  ```
  
## Register

  Return informasi pendaftaran sukses/gagal.

* **URL**
    
    `/register`

* **Method:**

    `POST`
  
*  **URL Params**

    **Required:**
 
    none
    
    **optional:**
    
    none

* **Body Params**

    **Required:**
 
        username    : String
        name        : String
        email       : String
        gender      : String
        password    : String
    
    **optional:**
    
        phone : String

* **Success Response:**

    ```javascript
    {
        error : false
    }
    ```
 
* **Error Response:**

    ```javascript
    {
        error : true,
        attentionField : String,
        message : String
    }
    ```

* **Sample Call:**

  ```javascript
    $.ajax({
      url: domain + "register",
      type : "POST",
      data : {
        username    : 'joko',
        name        : 'Joko Hariono',
        phone       : '012345678',
        email       : 'joko@gmail.com',
        gender      : 'l',
        password    : 'lalala',
      },
      success : function(data, status, xhr) {
        var rec = JSON.parse(xhr.responseText);
        if(!rec.error){
          console.log('success');
        } else {
          console.log('failed');
        }
      }
    });
  ```
  
## Forgot Password

  Return informasi request berhasil/gagal.

* **URL**
    
    `/forgot`

* **Method:**

    `POST`
  
*  **URL Params**

    **Required:**
 
    none
    
    **optional:**
    
    none

* **Body Params**

    **Required:**
 
        email : String
    
    **optional:**
    
    none

* **Success Response:**

    ```javascript
    {
        error : false
    }
    ```
 
* **Error Response:**

    ```javascript
    {
        error : true,
        message : String
    }
    ```

* **Sample Call:**

  ```javascript
    $.ajax({
      url: domain + "forgot",
      type : "POST",
      data : { email : 'example@example.com' },
      success : function(data, status, xhr) {
        var rec = JSON.parse(xhr.responseText);
        if(!rec.error){
          console.log('success');
        } else {
          console.log('failed');
        }
      }
    });
  ```
  
## Ambil Timeline Pelaporan

  Return list pelaporan.

* **URL**
    
    `/timeline`

* **Method:**

    `GET`
  
*  **URL Params**

    **Required:**
 
        start
        limit
    
    **optional:**
    
    none

* **Body Params**

    **Required:**
 
    none
    
    **optional:**
    
    none

* **Success Response:**

    ```javascript
    {
        error : false,
        data : [
            {
                id: Number,
            	user_id: Number,
        		title: String,
        		description: String,
        		created_date: Date,
        		category_id: Number,
        		sop_reportstatus_id: Number,
        		images: [String],
        		lat: String,
        		long: String,
            }
        ]
    }
    ```
 
* **Error Response:**

    ```javascript
    {
        error : true,
        message : String
    }
    ```

* **Sample Call:**

  ```javascript
    $.ajax({
      url: domain + "timeline?start=0&limit=5",
      type : "GET",
      success : function(data, status, xhr) {
        var rec = JSON.parse(xhr.responseText);
        if(!rec.error){
          console.log('success');
        } else {
          console.log('failed');
        }
      }
    });
  ```
  
## Ambil Informasi Profile Pengguna

  Return informasi pengguna.

* **URL**
    
    `/profile`

* **Method:**

    `GET`
  
*  **URL Params**

    **Required:**

        id
    
    **optional:**
    
    none

* **Body Params**

    **Required:**
 
    none
    
    **optional:**
    
    none

* **Success Response:**

    ```javascript
    {
        error : false,
        data : {
            id: Number,
    		username: String,
    		name: String,
    		phone: String,
    		email: String,
    		avatar: String,
    		gender: String,
    		created_date: Date,
    		last_login: Date,
    		verified: Boolean,
        }
    }
    ```
 
* **Error Response:**

    ```javascript
    {
        error : true,
        message : String
    }
    ```

* **Sample Call:**

  ```javascript
    $.ajax({
      url: domain + "profile?id=1",
      type : "GET",
      success : function(data, status, xhr) {
        var rec = JSON.parse(xhr.responseText);
        if(!rec.error){
          console.log('success');
        } else {
          console.log('failed');
        }
      }
    });
  ```
  
## Ambil data Laporan

  Return informasi 1 laporan.

* **URL**
    
    `/report`

* **Method:**

    `GET`
  
*  **URL Params**

    **Required:**

        id
    
    **optional:**
    
    none

* **Body Params**

    **Required:**
 
    none
    
    **optional:**
    
    none

* **Success Response:**

    ```javascript
    {
        error   : false,
        data    : {
            id: Number,
        	user_id: Number,
    		title: String,
    		description: String,
    		created_date: Date,
    		category_id: Number,
    		sop_reportstatus_id: Number,
    		images: [String],
    		lat: String,
    		long: String
        }
    }
    ```
 
* **Error Response:**

    ```javascript
    {
        error : true,
        message : String
    }
    ```

* **Sample Call:**

  ```javascript
    $.ajax({
      url: domain + "report?id=1",
      type : "GET",
      success : function(data, status, xhr) {
        var rec = JSON.parse(xhr.responseText);
        if(!rec.error){
          console.log('success');
        } else {
          console.log('failed');
        }
      }
    });
  ```
  
## Ambil Data Komentar Laporan

  Return data komentar dari suatu laporan.

* **URL**
    
    `/comment`

* **Method:**

    `GET`
  
*  **URL Params**

    **Required:**

        reportid
        start
        limit
    
    **optional:**
    
    none

* **Body Params**

    **Required:**
 
    none
    
    **optional:**
    
    none

* **Success Response:**

    ```javascript
    {
        error   : false,
        data    : [
            {
                id: Number,
            	report_id: Number,
        		text: String,
        		user_id: Number,
        		internal_id: Number,
        		date: Date
            }
        ]
    }
    ```
 
* **Error Response:**

    ```javascript
    {
        error : true,
        message : String
    }
    ```

* **Sample Call:**

  ```javascript
    $.ajax({
      url: domain + "comment?reportid=1&start=0&limit=10",
      type : "GET",
      success : function(data, status, xhr) {
        var rec = JSON.parse(xhr.responseText);
        if(!rec.error){
          console.log('success');
        } else {
          console.log('failed');
        }
      }
    });
  ```
  
## Membuat Laporan Baru

  Return informasi laporan berhasil/gagal dikirim.

* **URL**
    
    `/newreport`

* **Method:**

    `POST`
  
*  **URL Params**

    **Required:**

    none
    
    **optional:**
    
    none

* **Body Params**

    **Required:**
 
		description: String
    
    **optional:**
    
        title   : String
        images  : File

* **Success Response:**

    ```javascript
    {
        error   : false
    }
    ```
 
* **Error Response:**

    ```javascript
    {
        error : true,
        message : String
    }
    ```

* **Sample Call:**

  ```javascript
    $.ajax({
      url: domain + "newreport",
      type : "POST",
      enctype: 'multipart/form-data',
      data : formData,
      success : function(data, status, xhr) {
        var rec = JSON.parse(xhr.responseText);
        if(!rec.error){
          console.log('success');
        } else {
          console.log('failed');
        }
      }
    });
  ```
  
  *formData itu data dari form yang bisa upload file*
  
## Membuat Komentar Baru

  Return informasi komentar berhasil/gagal dikirim.

* **URL**
    
    `/newcomment`

* **Method:**

    `POST`
  
*  **URL Params**

    **Required:**

    none
    
    **optional:**
    
    none

* **Body Params**

    **Required:**
 
		reportid    : Number
		text        : String
    
    **optional:**
    
    none

* **Success Response:**

    ```javascript
    {
        error   : false
    }
    ```
 
* **Error Response:**

    ```javascript
    {
        error : true,
        message : String
    }
    ```

* **Sample Call:**

  ```javascript
    $.ajax({
      url: domain + "newcomment",
      type : "POST",
      data : {
        reportid    : 1,
        text        : 'tes komentaaarrrrr'
      },
      success : function(data, status, xhr) {
        var rec = JSON.parse(xhr.responseText);
        if(!rec.error){
          console.log('success');
        } else {
          console.log('failed');
        }
      }
    });
  ```
  
## Menghapus Laporan

  Return informasi laporan berhasil/gagal dihapus.

* **URL**
    
    `/deletereport`

* **Method:**

    `POST`
  
*  **URL Params**

    **Required:**

    none
    
    **optional:**
    
    none

* **Body Params**

    **Required:**
 
		reportid    : Number
    
    **optional:**
    
    none

* **Success Response:**

    ```javascript
    {
        error   : false
    }
    ```
 
* **Error Response:**

    ```javascript
    {
        error : true,
        message : String
    }
    ```

* **Sample Call:**

  ```javascript
    $.ajax({
      url: domain + "deletereport",
      type : "POST",
      data : {
        reportid    : 1
      },
      success : function(data, status, xhr) {
        var rec = JSON.parse(xhr.responseText);
        if(!rec.error){
          console.log('success');
        } else {
          console.log('failed');
        }
      }
    });
  ```
  
## Menghapus Komentar

  Return informasi komentar berhasil/gagal dihapus.

* **URL**
    
    `/deletecomment`

* **Method:**

    `POST`
  
*  **URL Params**

    **Required:**

    none
    
    **optional:**
    
    none

* **Body Params**

    **Required:**
 
		commentid    : Number
    
    **optional:**
    
    none

* **Success Response:**

    ```javascript
    {
        error   : false
    }
    ```
 
* **Error Response:**

    ```javascript
    {
        error : true,
        message : String
    }
    ```

* **Sample Call:**

  ```javascript
    $.ajax({
      url: domain + "deletecomment",
      type : "POST",
      data : {
        commentid    : 1
      },
      success : function(data, status, xhr) {
        var rec = JSON.parse(xhr.responseText);
        if(!rec.error){
          console.log('success');
        } else {
          console.log('failed');
        }
      }
    });
  ```
  
## Melihat Organisasi

  Return informasi organisasi dan list laporan yang masuk

* **URL**
    
    `/organization`

* **Method:**

    `GET`
  
*  **URL Params**

    **Required:**

        id
        start
        limit
    
    **optional:**
    
    none

* **Body Params**

    **Required:**
 
	none
    
    **optional:**
    
    none

* **Success Response:**

    ```javascript
    {
        error   : false,
        data    : {
            id          : Number,
    		name        : String,
    		email       : String,
    		phone       : String,
    		avatar      : String,
    		description : String,
    		created_date: Date,
    		lat         : String,
    		long        : String,
    		reports     : [
    		    {
    		        id: Number,
                	user_id: Number,
            		title: String,
            		description: String,
            		created_date: Date,
            		category_id: Number,
            		sop_reportstatus_id: Number,
            		images: [String],
            		lat: String,
            		long: String,
    		    }
    		]
        }
    }
    ```
 
* **Error Response:**

    ```javascript
    {
        error : true,
        message : String
    }
    ```

* **Sample Call:**

  ```javascript
    $.ajax({
      url: domain + "organization?id=1&start=0&limit=15",
      type : "GET",
      success : function(data, status, xhr) {
        var rec = JSON.parse(xhr.responseText);
        if(!rec.error){
          console.log('success');
        } else {
          console.log('failed');
        }
      }
    });
  ```